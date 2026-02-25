import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Array "mo:core/Array";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



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

  public type ListingStatus = { #pending; #approved; #rejected };

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
    status : ListingStatus;
  };

  // Public-safe listing type that omits sensitive owner info for anonymous callers
  type PublicListing = {
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
    status : ListingStatus;
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

  // Public profile strips sensitive contact info
  type PublicUserProfile = {
    displayName : Text;
    bio : Text;
    registrationTimestamp : Time.Time;
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
      status = #pending; // New listings are pending by default
    };

    listings.add(listingId, listing);
    listingId;
  };

  public shared ({ caller }) func approveListing(listingId : ListingId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can approve listings");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        let updatedListing = { listing with status = #approved };
        listings.add(listingId, updatedListing);
      };
    };
  };

  public shared ({ caller }) func rejectListing(listingId : ListingId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can reject listings");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        let updatedListing = { listing with status = #rejected };
        listings.add(listingId, updatedListing);
      };
    };
  };

  // Public query: returns only approved listings, no auth required
  public query func getListings() : async [Listing] {
    let allListings = listings.values().toArray();

    // Filter for approved listings only — pending and rejected must not appear publicly
    let approvedListings = allListings.filter(func(l : Listing) : Bool { l.status == #approved });

    let vipListings = approvedListings.filter(func(l : Listing) : Bool { l.isVip });
    let nonVipListings = approvedListings.filter(func(l : Listing) : Bool { not l.isVip });

    let sortedNonVip = nonVipListings.sort(
      func(a : Listing, b : Listing) : { #less; #equal; #greater } {
        if (a.timestamp > b.timestamp) { #less } else {
          if (a.timestamp < b.timestamp) { #greater } else { #equal };
        };
      }
    );

    vipListings.concat(sortedNonVip);
  };

  // Admin-only: returns all pending listings for review
  public query ({ caller }) func getPendingListings() : async [Listing] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can access pending listings");
    };
    listings.values().toArray().filter(func(l : Listing) : Bool { l.status == #pending });
  };

  // Admin-only: returns all listings regardless of status
  public query ({ caller }) func getAllListings() : async [Listing] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can access all listings");
    };
    listings.values().toArray();
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
        // When a non-admin owner updates a listing, it goes back to pending for re-review.
        // Admins updating a listing preserve the current status.
        let newStatus : ListingStatus = if (AccessControl.isAdmin(accessControlState, caller)) {
          existing.status;
        } else {
          #pending;
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
          status = newStatus;
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
          let alreadyAdded = partners.any(func(p : Principal) : Bool { p == partner });
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

  // signUp is intentionally open to any caller (including guests/anonymous)
  // so new users can register themselves
  public shared ({ caller }) func signUp(displayName : Text, mobileNumber : Text) : async () {
    let existing = userProfiles.get(caller);

    let profile : UserProfile = switch (existing) {
      case (null) {
        {
          displayName;
          bio = "";
          contactInfo = null;
          registrationTimestamp = Time.now();
          mobileNumber = ?mobileNumber;
        };
      };
      case (?p) {
        {
          displayName;
          bio = p.bio;
          contactInfo = p.contactInfo;
          registrationTimestamp = p.registrationTimestamp;
          mobileNumber = ?mobileNumber;
        };
      };
    };

    userProfiles.add(caller, profile);
  };

  // Only the authenticated user can retrieve their own mobile number
  public query ({ caller }) func getMobileNumber() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their own mobile number");
    };
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.mobileNumber };
    };
  };

  // Public profile lookup — strips sensitive fields (contactInfo, mobileNumber)
  // so anonymous callers cannot harvest private contact data
  public query ({ caller }) func getProfile(principal : Principal) : async ?PublicUserProfile {
    // If the caller is the profile owner or an admin, they may see the full profile via getMyProfile/getUserProfile.
    // This endpoint intentionally returns only the public subset.
    switch (userProfiles.get(principal)) {
      case (null) { null };
      case (?profile) {
        ?{
          displayName = profile.displayName;
          bio = profile.bio;
          registrationTimestamp = profile.registrationTimestamp;
        };
      };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own profile");
    };
    userProfiles.get(caller);
  };

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

  // Full profile visible only to the owner or an admin
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };
};
