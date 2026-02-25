import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Char "mo:core/Char";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";



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
    lastLoginTime : Int;
  };

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
  var totalLogins : Nat = 0;

  public query ({ caller }) func isAdmin() : async Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) { true } else { false };
  };

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
      Runtime.trap("Only users can create listings");
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
      status = #pending;
    };

    listings.add(listingId, listing);
    listingId;
  };

  public shared ({ caller }) func approveListing(listingId : ListingId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can approve listings");
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
      Runtime.trap("Only admin can reject listings");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        let updatedListing = { listing with status = #rejected };
        listings.add(listingId, updatedListing);
      };
    };
  };

  public query func getListings() : async [Listing] {
    let allListings = listings.values().toArray();
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

  public query ({ caller }) func getPendingListings() : async [Listing] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can access pending listings");
    };
    listings.values().toArray().filter(func(l : Listing) : Bool { l.status == #pending });
  };

  public query ({ caller }) func getAllListings() : async [Listing] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can access all listings");
    };
    listings.values().toArray();
  };

  public query ({ caller }) func getAllListingsAdmin() : async [Listing] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can access all listings");
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
      Runtime.trap("Only users can update listings");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Only the owner or an admin can update this listing");
        };
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
      Runtime.trap("Only users can delete listings");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Only the owner or an admin can delete this listing");
        };
        listings.remove(listingId);
      };
    };
  };

  public shared ({ caller }) func deleteListingAdmin(listingId : ListingId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can delete listings");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?_) {
        listings.remove(listingId);
        true;
      };
    };
  };

  public shared ({ caller }) func sendMessage(recipient : Principal, listingId : ?ListingId, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can send messages");
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
      Runtime.trap("Only users can view conversations");
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
      Runtime.trap("Only users can list conversations");
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

  public shared ({ caller }) func upsertProfile(displayName : Text, bio : Text, contactInfo : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can create or update profiles");
    };

    let existing = userProfiles.get(caller);
    let registrationTimestamp = switch (existing) {
      case (null) { Time.now() };
      case (?p) { p.registrationTimestamp };
    };

    let now = Time.now();

    let profile : UserProfile = {
      displayName;
      bio;
      contactInfo;
      registrationTimestamp;
      lastLoginTime = now;
      mobileNumber = switch (existing) { case (null) { null }; case (?p) { p.mobileNumber } };
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func signUp(displayName : Text, mobileNumber : Text) : async Text {
    let cleanedNumber = cleanNumber(mobileNumber);

    if (not isValid(cleanedNumber)) {
      Runtime.trap("Invalid mobile number given");
    };

    let existing = userProfiles.get(caller);
    let now = Time.now();

    let profile : UserProfile = switch (existing) {
      case (null) {
        {
          displayName;
          bio = "";
          contactInfo = null;
          registrationTimestamp = now;
          lastLoginTime = now;
          mobileNumber = ?cleanedNumber;
        };
      };
      case (?p) {
        {
          displayName;
          bio = p.bio;
          contactInfo = p.contactInfo;
          registrationTimestamp = p.registrationTimestamp;
          lastLoginTime = now;
          mobileNumber = ?cleanedNumber;
        };
      };
    };

    userProfiles.add(caller, profile);

    "Success";
  };

  func isValid(number : Text) : Bool {
    number.size() >= 10;
  };

  func cleanNumber(number : Text) : Text {
    number.toArray().filter(
      func(c) {
        c >= '0' and c <= '9';
      }
    ).toText();
  };

  public query ({ caller }) func getMobileNumber() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can get their own mobile number");
    };
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.mobileNumber };
    };
  };

  public query ({ caller }) func getProfile(principal : Principal) : async ?PublicUserProfile {
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
      Runtime.trap("Only users can view their own profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(displayName : Text, bio : Text, contactInfo : ?Text, mobileNumber : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can save profiles");
    };

    let existing = userProfiles.get(caller);
    let registrationTimestamp = switch (existing) {
      case (null) { Time.now() };
      case (?p) { p.registrationTimestamp };
    };

    let now = Time.now();

    let profile : UserProfile = {
      displayName;
      bio;
      contactInfo;
      registrationTimestamp;
      lastLoginTime = now;
      mobileNumber;
    };

    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getTotalListingsCount() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can access total listings count");
    };
    listings.size();
  };

  public query ({ caller }) func getPendingListingsCount() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can access pending listings count");
    };
    let allListings = listings.values().toArray();
    let pendingListings = allListings.filter(func(l : Listing) : Bool { l.status == #pending });
    pendingListings.size();
  };

  public query ({ caller }) func getApprovedListingsCount() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can access approved listings count");
    };
    let allListings = listings.values().toArray();
    let approvedListings = allListings.filter(func(l : Listing) : Bool { l.status == #approved });
    approvedListings.size();
  };

  public query ({ caller }) func getTotalUsersCount() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can access total user count");
    };
    userProfiles.size();
  };

  public query ({ caller }) func getTotalLoginsCount() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      0;
    } else {
      totalLogins;
    };
  };

  public query ({ caller }) func getAllMobileNumbers() : async [(Principal, Text)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can access mobile numbers");
    };

    let allEntries = userProfiles.toArray();
    let nonNullNumbers = allEntries.filter(
      func((p, profile)) { profile.mobileNumber != null }
    );

    let resultArray = nonNullNumbers.values().map(
      func((p, profile)) { (p, switch (profile.mobileNumber) { case (null) { "" }; case (?number) { number } }) }
    ).toArray();

    resultArray;
  };

  public query ({ caller }) func getAllUsersWithActivity() : async [(Principal, Text, Int)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) { return [] };
    userProfiles.toArray().map(func((principal, profile)) { (principal, profile.displayName, profile.lastLoginTime) });
  };
};
