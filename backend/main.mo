import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  type ListingId = Nat;
  type AnimalCategory = {
    #dog;
    #cat;
    #bird;
    #fish;
    #reptile;
    #smallAnimal;
    #other;
    #cow;
    #buffalo;
    #goat;
    #sheep;
  };

  type Listing = {
    id : ListingId;
    owner : Principal;
    title : Text;
    description : Text;
    price : Nat;
    category : AnimalCategory;
    location : Text;
    photoUrls : [Text];
    timestamp : Time.Time;
    isActive : Bool;
    isVip : Bool;
  };

  type Message = {
    sender : Principal;
    recipient : Principal;
    listingId : ?ListingId;
    text : Text;
    timestamp : Time.Time;
  };

  type UserProfile = {
    displayName : Text;
    bio : Text;
    contactInfo : ?Text;
    registrationTimestamp : Time.Time;
    mobileNumber : ?Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let listings = Map.empty<ListingId, Listing>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let messages = Map.empty<Principal, List.List<Message>>();

  var nextListingId : ListingId = 0;

  // Listings API

  public shared ({ caller }) func createListing(
    title : Text,
    description : Text,
    price : Nat,
    category : AnimalCategory,
    location : Text,
    photoUrls : [Text],
    isVip : Bool,
  ) : async ListingId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };

    let listingId = nextListingId;
    nextListingId += 1;

    let listing : Listing = {
      id = listingId;
      owner = caller;
      title;
      description;
      price;
      category;
      location;
      photoUrls;
      timestamp = Time.now();
      isActive = true;
      isVip;
    };

    listings.add(listingId, listing);
    listingId;
  };

  public query func getListings() : async [Listing] {
    let allListings = listings.values().toArray();

    let vipListings = allListings.filter(func(l) { l.isVip });
    let nonVipListings = allListings.filter(func(l) { not l.isVip });

    let sortedNonVip = nonVipListings.sort(
      func(a, b) {
        if (a.timestamp > b.timestamp) { #less } else {
          if (a.timestamp < b.timestamp) { #greater } else { #equal };
        };
      }
    );

    vipListings.concat(sortedNonVip);
  };

  public query func getListing(listingId : ListingId) : async ?Listing {
    listings.get(listingId);
  };

  public shared ({ caller }) func updateListing(
    listingId : ListingId,
    title : Text,
    description : Text,
    price : Nat,
    category : AnimalCategory,
    location : Text,
    photoUrls : [Text],
    isActive : Bool,
    isVip : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can update this listing");
        };
        let updated : Listing = {
          id = existing.id;
          owner = existing.owner;
          title;
          description;
          price;
          category;
          location;
          photoUrls;
          timestamp = existing.timestamp;
          isActive;
          isVip;
        };
        listings.add(listingId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteListing(listingId : ListingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can delete this listing");
        };
        listings.remove(listingId);
      };
    };
  };

  // Messaging API

  public shared ({ caller }) func sendMessage(recipient : Principal, listingId : ?ListingId, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let newMessage : Message = {
      sender = caller;
      recipient;
      listingId;
      text;
      timestamp = Time.now();
    };

    let messagesForRecipient = switch (messages.get(recipient)) {
      case (null) { List.empty<Message>() };
      case (?msgs) { msgs };
    };
    messagesForRecipient.add(newMessage);
    messages.add(recipient, messagesForRecipient);
  };

  public query ({ caller }) func getConversation(other : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    let allMessages = List.empty<Message>();

    switch (messages.get(caller)) {
      case (null) {};
      case (?msgs) {
        for (msg in msgs.values()) {
          if (msg.sender == other or msg.recipient == other) {
            allMessages.add(msg);
          };
        };
      };
    };

    switch (messages.get(other)) {
      case (null) {};
      case (?msgs) {
        for (msg in msgs.values()) {
          if (msg.sender == caller and msg.recipient == other) {
            allMessages.add(msg);
          };
        };
      };
    };

    allMessages.toArray();
  };

  public query ({ caller }) func listConversations() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list conversations");
    };

    let partners = List.empty<Principal>();

    switch (messages.get(caller)) {
      case (null) {};
      case (?msgs) {
        for (msg in msgs.values()) {
          let partner = if (msg.sender == caller) { msg.recipient } else { msg.sender };
          let alreadyAdded = partners.any(func(p) { p == partner });
          if (not alreadyAdded) {
            partners.add(partner);
          };
        };
      };
    };

    partners.toArray();
  };

  // User Profile API

  public shared ({ caller }) func upsertProfile(displayName : Text, bio : Text, contactInfo : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update profiles");
    };

    let existing = userProfiles.get(caller);
    let registrationTimestamp = switch (existing) {
      case (null) { Time.now() };
      case (?p) { p.registrationTimestamp };
    };

    let profile : UserProfile = {
      displayName;
      bio;
      contactInfo;
      registrationTimestamp;
      mobileNumber = switch (existing) { case (null) { null }; case (?p) { p.mobileNumber } };
    };

    userProfiles.add(caller, profile);
  };

  // signUp is accessible to any caller including guests, because new users
  // have not yet been assigned the #user role. Anonymous principals (guests)
  // must be able to call this to register. If a profile already exists,
  // only displayName and mobileNumber are updated; other fields are preserved.
  public shared ({ caller }) func signUp(displayName : Text, mobileNumber : Text) : async () {
    // No permission check: guests and new users must be able to sign up.
    // Anonymous principals are intentionally allowed so that identity-based
    // sign-up flows work before a role is assigned.

    let existing = userProfiles.get(caller);

    let profile : UserProfile = switch (existing) {
      case (null) {
        // Brand new profile
        {
          displayName;
          bio = "";
          contactInfo = null;
          registrationTimestamp = Time.now();
          mobileNumber = ?mobileNumber;
        }
      };
      case (?p) {
        // Existing profile: update only displayName and mobileNumber
        {
          displayName;
          bio = p.bio;
          contactInfo = p.contactInfo;
          registrationTimestamp = p.registrationTimestamp;
          mobileNumber = ?mobileNumber;
        }
      };
    };

    userProfiles.add(caller, profile);
  };

  // getMobileNumber: only the authenticated user can retrieve their own mobile number.
  public query ({ caller }) func getMobileNumber() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their own mobile number");
    };
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.mobileNumber };
    };
  };

  // Public profile lookup — no auth required (marketplace use case: view seller profiles)
  public query func getProfile(principal : Principal) : async ?UserProfile {
    userProfiles.get(principal);
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own profile");
    };
    userProfiles.get(caller);
  };

  // Required profile functions for the frontend

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(displayName : Text, bio : Text, contactInfo : ?Text, mobileNumber : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existing = userProfiles.get(caller);
    let registrationTimestamp = switch (existing) {
      case (null) { Time.now() };
      case (?p) { p.registrationTimestamp };
    };

    let profile : UserProfile = {
      displayName;
      bio;
      contactInfo;
      registrationTimestamp;
      mobileNumber;
    };

    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };
};
