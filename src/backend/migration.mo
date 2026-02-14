import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type DayOfWeek = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
  };

  type TaskType = {
    #dayOfWeek : DayOfWeek;
    #daily;
    #weekend;
  };

  type Task = {
    id : Nat;
    description : Text;
    completed : Bool;
    createdAt : Time.Time;
    dueDate : ?Time.Time;
    taskType : TaskType;
  };

  type Goal = {
    id : Nat;
    title : Text;
    description : Text;
    targetDate : ?Time.Time;
    progress : Nat;
  };

  type BudgetItemType = {
    #income;
    #expense;
  };

  type Recurrence = {
    #daily;
    #weekly;
    #monthly;
    #yearly;
  };

  type CalendarEntry = {
    id : Nat;
    title : Text;
    description : Text;
    startTime : Time.Time;
    endTime : ?Time.Time;
    taskId : ?Nat;
    recurrence : ?Recurrence;
  };

  type BudgetItem = {
    id : Nat;
    amount : Nat;
    description : Text;
    date : Time.Time;
    itemType : BudgetItemType;
  };

  type UserProfile = {
    name : Text;
  };

  type CryptoEntry = {
    id : Nat;
    symbol : Text;
    amount : Nat;
    purchasePriceCents : Nat;
    currentPriceCents : Nat;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type OldCalendarEntry = {
    id : Nat;
    title : Text;
    description : Text;
    startTime : Time.Time;
    endTime : ?Time.Time;
  };

  type OldActor = {
    tasks : Map.Map<Principal, List.List<Task>>;
    goals : Map.Map<Principal, List.List<Goal>>;
    calendarEntries : Map.Map<Principal, List.List<OldCalendarEntry>>;
    budgetItems : Map.Map<Principal, List.List<BudgetItem>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    cryptoPortfolios : Map.Map<Principal, List.List<CryptoEntry>>;
  };

  type NewActor = {
    tasks : Map.Map<Principal, List.List<Task>>;
    goals : Map.Map<Principal, List.List<Goal>>;
    calendarEntries : Map.Map<Principal, List.List<CalendarEntry>>;
    budgetItems : Map.Map<Principal, List.List<BudgetItem>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    cryptoPortfolios : Map.Map<Principal, List.List<CryptoEntry>>;
  };

  public func run(old : OldActor) : NewActor {
    let newCalendarEntries = old.calendarEntries.map<Principal, List.List<OldCalendarEntry>, List.List<CalendarEntry>>(
      func(_principal, oldEntries) {
        oldEntries.map<OldCalendarEntry, CalendarEntry>(
          func(oldEntry) {
            {
              oldEntry with
              taskId = null;
              recurrence = null;
            };
          }
        );
      }
    );
    {
      old with calendarEntries = newCalendarEntries;
    };
  };
}
