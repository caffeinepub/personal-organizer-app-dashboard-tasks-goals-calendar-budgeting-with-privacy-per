import Int "mo:core/Int";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Task = {
    id : Nat;
    description : Text;
    completed : Bool;
    createdAt : Time.Time;
    dueDate : ?Time.Time;
  };

  module Task {
    public func compare(a : Task, b : Task) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Goal = {
    id : Nat;
    title : Text;
    description : Text;
    targetDate : ?Time.Time;
    progress : Nat;
  };

  module Goal {
    public func compare(a : Goal, b : Goal) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type CalendarEntry = {
    id : Nat;
    title : Text;
    description : Text;
    startTime : Time.Time;
    endTime : ?Time.Time;
  };

  module CalendarEntry {
    public func compare(a : CalendarEntry, b : CalendarEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type BudgetItemType = {
    #income;
    #expense;
  };

  public type BudgetItem = {
    id : Nat;
    amount : Nat;
    description : Text;
    date : Time.Time;
    itemType : BudgetItemType;
  };

  module BudgetItem {
    public func compare(a : BudgetItem, b : BudgetItem) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type CryptoEntry = {
    id : Nat;
    symbol : Text;
    amount : Nat;
    purchasePriceCents : Nat;
    currentPriceCents : Nat;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  module CryptoEntry {
    public func compare(a : CryptoEntry, b : CryptoEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  // Persistent state for all users
  let tasks = Map.empty<Principal, List.List<Task>>();
  let goals = Map.empty<Principal, List.List<Goal>>();
  let calendarEntries = Map.empty<Principal, List.List<CalendarEntry>>();
  let budgetItems = Map.empty<Principal, List.List<BudgetItem>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let cryptoPortfolios = Map.empty<Principal, List.List<CryptoEntry>>();

  // Profiles
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Tasks - Create Task
  public shared ({ caller }) func createTask(description : Text, dueDate : ?Time.Time) : async Task {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let taskId = (Time.now() % 1000000).toNat();
    let task : Task = {
      id = taskId;
      description;
      completed = false;
      createdAt = Time.now();
      dueDate;
    };

    let userTasks = switch (tasks.get(caller)) {
      case (null) { List.empty<Task>() };
      case (?existing) { existing };
    };

    userTasks.add(task);
    tasks.add(caller, userTasks);
    task;
  };

  // Tasks - Get All Tasks
  public query ({ caller }) func getTasks(user : Principal) : async [Task] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tasks");
    };
    switch (tasks.get(user)) {
      case (null) { [] };
      case (?userTasks) { userTasks.toArray().sort() };
    };
  };

  // Tasks - Update Task
  public shared ({ caller }) func updateTask(taskId : Nat, description : Text, dueDate : ?Time.Time) : async ?Task {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    let userTasks = switch (tasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?existing) { existing };
    };

    let updatedTasks = userTasks.map<Task, Task>(
      func(task) {
        if (task.id == taskId) {
          {
            task with
            description;
            dueDate;
          };
        } else {
          task;
        };
      }
    );

    tasks.add(caller, updatedTasks);
    let filtered = updatedTasks.toArray().filter(func(task) { task.id == taskId });
    if (filtered.size() > 0) { ?filtered[0] } else { null };
  };

  // Tasks - Toggle Task Completion
  public shared ({ caller }) func toggleTaskCompletion(taskId : Nat) : async ?Task {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can toggle task completion");
    };

    let userTasks = switch (tasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?existing) { existing };
    };

    let updatedTasks = userTasks.map<Task, Task>(
      func(task) {
        if (task.id == taskId) {
          { task with completed = not task.completed };
        } else {
          task;
        };
      }
    );

    tasks.add(caller, updatedTasks);
    let filtered = updatedTasks.toArray().filter(func(task) { task.id == taskId });
    if (filtered.size() > 0) { ?filtered[0] } else { null };
  };

  // Tasks - Delete Task
  public shared ({ caller }) func deleteTask(taskId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    let userTasks = switch (tasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?existing) { existing };
    };

    let filteredTasks = userTasks.filter(
      func(task) { task.id != taskId }
    );

    tasks.add(caller, filteredTasks);
  };

  // Goals - Create Goal
  public shared ({ caller }) func createGoal(title : Text, description : Text, targetDate : ?Time.Time) : async Goal {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create goals");
    };

    let goalId = (Time.now() % 1000000).toNat();
    let goal : Goal = {
      id = goalId;
      title;
      description;
      targetDate;
      progress = 0;
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { List.empty<Goal>() };
      case (?existing) { existing };
    };

    userGoals.add(goal);
    goals.add(caller, userGoals);
    goal;
  };

  // Goals - Get All Goals
  public query ({ caller }) func getGoals(user : Principal) : async [Goal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view goals");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own goals");
    };
    switch (goals.get(user)) {
      case (null) { [] };
      case (?userGoals) { userGoals.toArray().sort() };
    };
  };

  // Goals - Update Goal
  public shared ({ caller }) func updateGoal(goalId : Nat, title : Text, description : Text, targetDate : ?Time.Time) : async ?Goal {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update goals");
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?existing) { existing };
    };

    let updatedGoals = userGoals.map<Goal, Goal>(
      func(goal) {
        if (goal.id == goalId) {
          {
            goal with
            title;
            description;
            targetDate;
          };
        } else {
          goal;
        };
      }
    );

    goals.add(caller, updatedGoals);
    let filtered = updatedGoals.toArray().filter(func(goal) { goal.id == goalId });
    if (filtered.size() > 0) { ?filtered[0] } else { null };
  };

  // Goals - Update Goal Progress
  public shared ({ caller }) func updateGoalProgress(goalId : Nat, progress : Nat) : async ?Goal {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update goal progress");
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?existing) { existing };
    };

    let updatedGoals = userGoals.map<Goal, Goal>(
      func(goal) {
        if (goal.id == goalId) {
          { goal with progress };
        } else {
          goal;
        };
      }
    );

    goals.add(caller, updatedGoals);
    let filtered = updatedGoals.toArray().filter(func(goal) { goal.id == goalId });
    if (filtered.size() > 0) { ?filtered[0] } else { null };
  };

  // Goals - Delete Goal
  public shared ({ caller }) func deleteGoal(goalId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete goals");
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?existing) { existing };
    };

    let filteredGoals = userGoals.filter(
      func(goal) { goal.id != goalId }
    );

    goals.add(caller, filteredGoals);
  };

  // Calendar - Create Calendar Entry
  public shared ({ caller }) func createCalendarEntry(title : Text, description : Text, startTime : Time.Time, endTime : ?Time.Time) : async CalendarEntry {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create calendar entries");
    };

    let entryId = (Time.now() % 1000000).toNat();
    let entry : CalendarEntry = {
      id = entryId;
      title;
      description;
      startTime;
      endTime;
    };

    let userEntries = switch (calendarEntries.get(caller)) {
      case (null) { List.empty<CalendarEntry>() };
      case (?existing) { existing };
    };

    userEntries.add(entry);
    calendarEntries.add(caller, userEntries);
    entry;
  };

  // Calendar - Get All Calendar Entries
  public query ({ caller }) func getCalendarEntries(user : Principal) : async [CalendarEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view calendar entries");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own calendar entries");
    };
    switch (calendarEntries.get(user)) {
      case (null) { [] };
      case (?userEntries) { userEntries.toArray().sort() };
    };
  };

  // Calendar - Update Calendar Entry
  public shared ({ caller }) func updateCalendarEntry(entryId : Nat, title : Text, description : Text, startTime : Time.Time, endTime : ?Time.Time) : async ?CalendarEntry {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update calendar entries");
    };

    let userEntries = switch (calendarEntries.get(caller)) {
      case (null) { Runtime.trap("Calendar entry not found") };
      case (?existing) { existing };
    };

    let updatedEntries = userEntries.map<CalendarEntry, CalendarEntry>(
      func(entry) {
        if (entry.id == entryId) {
          {
            entry with
            title;
            description;
            startTime;
            endTime;
          };
        } else {
          entry;
        };
      }
    );

    calendarEntries.add(caller, updatedEntries);
    let filtered = updatedEntries.toArray().filter(func(entry) { entry.id == entryId });
    if (filtered.size() > 0) { ?filtered[0] } else { null };
  };

  // Calendar - Delete Calendar Entry
  public shared ({ caller }) func deleteCalendarEntry(entryId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete calendar entries");
    };

    let userEntries = switch (calendarEntries.get(caller)) {
      case (null) { Runtime.trap("Calendar entry not found") };
      case (?existing) { existing };
    };

    let filteredEntries = userEntries.filter(
      func(entry) { entry.id != entryId }
    );

    calendarEntries.add(caller, filteredEntries);
  };

  // Budget - Create Budget Item
  public shared ({ caller }) func createBudgetItem(amount : Nat, description : Text, date : Time.Time, itemType : BudgetItemType) : async BudgetItem {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create budget items");
    };

    let itemId = (Time.now() % 1000000).toNat();
    let item : BudgetItem = {
      id = itemId;
      amount;
      description;
      date;
      itemType;
    };

    let userItems = switch (budgetItems.get(caller)) {
      case (null) { List.empty<BudgetItem>() };
      case (?existing) { existing };
    };

    userItems.add(item);
    budgetItems.add(caller, userItems);
    item;
  };

  // Budget - Get All Budget Items
  public query ({ caller }) func getBudgetItems(user : Principal) : async [BudgetItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view budget items");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own budget items");
    };
    switch (budgetItems.get(user)) {
      case (null) { [] };
      case (?userItems) { userItems.toArray().sort() };
    };
  };

  // Budget - Update Budget Item
  public shared ({ caller }) func updateBudgetItem(itemId : Nat, amount : Nat, description : Text, date : Time.Time, itemType : BudgetItemType) : async ?BudgetItem {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update budget items");
    };

    let userItems = switch (budgetItems.get(caller)) {
      case (null) { Runtime.trap("Budget item not found") };
      case (?existing) { existing };
    };

    let updatedItems = userItems.map<BudgetItem, BudgetItem>(
      func(item) {
        if (item.id == itemId) {
          {
            item with
            amount;
            description;
            date;
            itemType;
          };
        } else {
          item;
        };
      }
    );

    budgetItems.add(caller, updatedItems);
    let filtered = updatedItems.toArray().filter(func(item) { item.id == itemId });
    if (filtered.size() > 0) { ?filtered[0] } else { null };
  };

  // Budget - Delete Budget Item
  public shared ({ caller }) func deleteBudgetItem(itemId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete budget items");
    };

    let userItems = switch (budgetItems.get(caller)) {
      case (null) { Runtime.trap("Budget item not found") };
      case (?existing) { existing };
    };

    let filteredItems = userItems.filter(
      func(item) { item.id != itemId }
    );

    budgetItems.add(caller, filteredItems);
  };

  // Crypto Portfolio - Create Entry
  public shared ({ caller }) func createCryptoEntry(symbol : Text, amount : Nat, purchasePriceCents : Nat, currentPriceCents : Nat) : async CryptoEntry {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create crypto entries");
    };

    let entryId = (Time.now() % 1000000).toNat();
    let entry : CryptoEntry = {
      id = entryId;
      symbol;
      amount;
      purchasePriceCents;
      currentPriceCents;
      createdAt = Time.now();
      updatedAt = Time.now();
    };

    let userEntries = switch (cryptoPortfolios.get(caller)) {
      case (null) { List.empty<CryptoEntry>() };
      case (?existing) { existing };
    };

    userEntries.add(entry);
    cryptoPortfolios.add(caller, userEntries);
    entry;
  };

  // Crypto Portfolio - Get All Entries
  public query ({ caller }) func getCryptoPortfolio(user : Principal) : async [CryptoEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view crypto portfolios");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own crypto portfolio");
    };
    switch (cryptoPortfolios.get(user)) {
      case (null) { [] };
      case (?userEntries) { userEntries.toArray().sort() };
    };
  };

  // Crypto Portfolio - Update Entry
  public shared ({ caller }) func updateCryptoEntry(entryId : Nat, amount : Nat, purchasePriceCents : Nat, currentPriceCents : Nat) : async ?CryptoEntry {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update crypto entries");
    };

    let userEntries = switch (cryptoPortfolios.get(caller)) {
      case (null) { Runtime.trap("Crypto entry not found") };
      case (?existing) { existing };
    };

    let updatedEntries = userEntries.map<CryptoEntry, CryptoEntry>(
      func(entry) {
        if (entry.id == entryId) {
          {
            entry with
            amount;
            purchasePriceCents;
            currentPriceCents;
            updatedAt = Time.now();
          };
        } else {
          entry;
        };
      }
    );

    cryptoPortfolios.add(caller, updatedEntries);
    let filtered = updatedEntries.toArray().filter(func(entry) { entry.id == entryId });
    if (filtered.size() > 0) { ?filtered[0] } else { null };
  };

  // Crypto Portfolio - Delete Entry
  public shared ({ caller }) func deleteCryptoEntry(entryId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete crypto entries");
    };

    let userEntries = switch (cryptoPortfolios.get(caller)) {
      case (null) { Runtime.trap("Crypto entry not found") };
      case (?existing) { existing };
    };

    let filteredEntries = userEntries.filter(
      func(entry) { entry.id != entryId }
    );

    cryptoPortfolios.add(caller, filteredEntries);
  };
};
