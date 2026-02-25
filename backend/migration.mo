import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Time "mo:core/Time";

module {
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

  type OldListing = {
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
  };

  type NewListing = {
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

  type OldActor = {
    listings : Map.Map<ListingId, OldListing>;
    userProfiles : Map.Map<Principal, UserProfile>;
    messages : Map.Map<Principal, List.List<Message>>;
    nextListingId : Nat;
  };

  type NewActor = {
    listings : Map.Map<ListingId, NewListing>;
    userProfiles : Map.Map<Principal, UserProfile>;
    messages : Map.Map<Principal, List.List<Message>>;
    nextListingId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newListings = old.listings.map<ListingId, OldListing, NewListing>(
      func(_id, oldListing) {
        { oldListing with isVip = false };
      }
    );
    { old with listings = newListings };
  };
};
