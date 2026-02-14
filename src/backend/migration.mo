import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    tasks : Map.Map<Principal, List.List<{ id : Nat; description : Text; completed : Bool; createdAt : Int; dueDate : ?Int }>>;
    goals : Map.Map<Principal, List.List<{ id : Nat; title : Text; description : Text; targetDate : ?Int; progress : Nat }>>;
    calendarEntries : Map.Map<Principal, List.List<{ id : Nat; title : Text; description : Text; startTime : Int; endTime : ?Int }>>;
    budgetItems : Map.Map<Principal, List.List<{ id : Nat; amount : Nat; description : Text; date : Int; itemType : { #income; #expense } }>>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type NewActor = {
    tasks : Map.Map<Principal, List.List<{ id : Nat; description : Text; completed : Bool; createdAt : Int; dueDate : ?Int }>>;
    goals : Map.Map<Principal, List.List<{ id : Nat; title : Text; description : Text; targetDate : ?Int; progress : Nat }>>;
    calendarEntries : Map.Map<Principal, List.List<{ id : Nat; title : Text; description : Text; startTime : Int; endTime : ?Int }>>;
    budgetItems : Map.Map<Principal, List.List<{ id : Nat; amount : Nat; description : Text; date : Int; itemType : { #income; #expense } }>>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    cryptoPortfolios : Map.Map<Principal, List.List<{ id : Nat; symbol : Text; amount : Nat; purchasePriceCents : Nat; currentPriceCents : Nat; createdAt : Int; updatedAt : Int }>>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      cryptoPortfolios = Map.empty<Principal, List.List<{ id : Nat; symbol : Text; amount : Nat; purchasePriceCents : Nat; currentPriceCents : Nat; createdAt : Int; updatedAt : Int }>>()
    };
  };
};
