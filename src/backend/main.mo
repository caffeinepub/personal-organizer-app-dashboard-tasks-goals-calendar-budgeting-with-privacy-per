import Int "mo:core/Int";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use migration to preserve data across upgrades

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type TaskType = {
    #dayOfWeek : DayOfWeek;
    #daily;
    #weekend;
  };

  public type DayOfWeek = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
  };

  public type Task = {
    id : Nat;
    description : Text;
    completed : Bool;
    createdAt : Time.Time;
    dueDate : ?Time.Time;
    taskType : TaskType;
  };

  public type Goal = {
    id : Nat;
    title : Text;
    description : Text;
    targetDate : ?Time.Time;
    progress : Nat;
  };

  public type Recurrence = {
    #daily;
    #weekly;
    #monthly;
    #yearly;
  };

  public type CalendarEntry = {
    id : Nat;
    title : Text;
    description : Text;
    startTime : Time.Time;
    endTime : ?Time.Time;
    taskId : ?Nat;
    recurrence : ?Recurrence;
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

  public type CryptoEntry = {
    id : Nat;
    symbol : Text;
    amount : Nat;
    purchasePriceCents : Nat;
    currentPriceCents : Nat;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  let tasks = Map.empty<Principal, List.List<Task>>();
  let goals = Map.empty<Principal, List.List<Goal>>();
  let calendarEntries = Map.empty<Principal, List.List<CalendarEntry>>();
  let budgetItems = Map.empty<Principal, List.List<BudgetItem>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let cryptoPortfolios = Map.empty<Principal, List.List<CryptoEntry>>();

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

  public shared ({ caller }) func createTask(description : Text, dueDate : ?Time.Time, taskType : TaskType) : async Task {
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
      taskType;
    };

    let userTasks = switch (tasks.get(caller)) {
      case (null) { List.empty<Task>() };
      case (?existing) { existing };
    };

    userTasks.add(task);
    tasks.add(caller, userTasks);

    switch (dueDate) {
      case (?date) {
        addTaskToCalendar(caller, task, date, null, null);
      };
      case (null) {};
    };

    task;
  };

  public query ({ caller }) func getTasks(user : Principal) : async [Task] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tasks");
    };
    switch (tasks.get(user)) {
      case (null) { [] };
      case (?userTasks) { userTasks.toArray() };
    };
  };

  public shared ({ caller }) func updateTask(taskId : Nat, description : Text, dueDate : ?Time.Time, taskType : TaskType) : async ?Task {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    let userTasks = switch (tasks.get(caller)) {
      case (null) { Runtime.trap("Task not found") };
      case (?existing) { existing };
    };

    var updatedTask : ?Task = null;

    let updatedTasks = userTasks.map<Task, Task>(
      func(task) {
        if (task.id == taskId) {
          let newTask = {
            task with
            description;
            dueDate;
            taskType;
          };
          updatedTask := ?newTask;
          newTask;
        } else {
          task;
        };
      }
    );

    tasks.add(caller, updatedTasks);

    switch (updatedTask, dueDate) {
      case (?task, _) {
        updateTaskInCalendar(caller, task);
      };
      case (null, _) {};
    };

    updatedTask;
  };

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

    deleteTaskFromCalendar(caller, taskId);
  };

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

  public query ({ caller }) func getGoals(user : Principal) : async [Goal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view goals");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own goals");
    };
    switch (goals.get(user)) {
      case (null) { [] };
      case (?userGoals) { userGoals.toArray() };
    };
  };

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

  public shared ({ caller }) func createCalendarEntry(title : Text, description : Text, startTime : Time.Time, endTime : ?Time.Time, recurrence : ?Recurrence, taskId : ?Nat) : async CalendarEntry {
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
      taskId;
      recurrence;
    };

    let userEntries = switch (calendarEntries.get(caller)) {
      case (null) { List.empty<CalendarEntry>() };
      case (?existing) { existing };
    };

    userEntries.add(entry);
    calendarEntries.add(caller, userEntries);

    switch (taskId) {
      case (?_id) {
        createTaskFromCalendarEntry(caller, entry, title, description, startTime);
      };
      case (null) {};
    };

    entry;
  };

  public query ({ caller }) func getCalendarEntries(user : Principal) : async [CalendarEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view calendar entries");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own calendar entries");
    };
    switch (calendarEntries.get(user)) {
      case (null) { [] };
      case (?userEntries) { userEntries.toArray() };
    };
  };

  public shared ({ caller }) func updateCalendarEntry(entryId : Nat, title : Text, description : Text, startTime : Time.Time, endTime : ?Time.Time, recurrence : ?Recurrence, taskId : ?Nat) : async ?CalendarEntry {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update calendar entries");
    };

    let userEntries = switch (calendarEntries.get(caller)) {
      case (null) { Runtime.trap("Calendar entry not found") };
      case (?existing) { existing };
    };

    var updatedEntry : ?CalendarEntry = null;

    let updatedEntries = userEntries.map<CalendarEntry, CalendarEntry>(
      func(entry) {
        if (entry.id == entryId) {
          let newEntry = {
            entry with
            title;
            description;
            startTime;
            endTime;
            recurrence;
            taskId;
          };
          updatedEntry := ?newEntry;
          newEntry;
        } else {
          entry;
        };
      }
    );

    calendarEntries.add(caller, updatedEntries);

    switch (updatedEntry) {
      case (?entry) {
        switch (entry.taskId) {
          case (?taskId) {
            updateTaskFromCalendarEntry(caller, entry, taskId);
          };
          case (null) {};
        };
      };
      case (null) {};
    };

    updatedEntry;
  };

  public shared ({ caller }) func deleteCalendarEntry(entryId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete calendar entries");
    };

    let userEntries = switch (calendarEntries.get(caller)) {
      case (null) { Runtime.trap("Calendar entry not found") };
      case (?existing) { existing };
    };

    let deletedEntries = userEntries.filter(
      func(entry) { entry.id == entryId }
    ).toArray();

    let filteredEntries = userEntries.filter(
      func(entry) { entry.id != entryId }
    );

    calendarEntries.add(caller, filteredEntries);

    if (deletedEntries.size() > 0) {
      let deletedEntry = deletedEntries[0];
      switch (deletedEntry.taskId) {
        case (?taskId) {
          deleteTaskFromCalendarEntry(caller, taskId);
        };
        case (null) {};
      };
    };
  };

  public query ({ caller }) func getRecurringEntries() : async [CalendarEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view recurring entries");
    };
    
    switch (calendarEntries.get(caller)) {
      case (null) { [] };
      case (?userEntries) {
        userEntries.filter(
          func(entry) { entry.recurrence != null }
        ).toArray();
      };
    };
  };

  public shared ({ caller }) func createRecurringEntry(title : Text, description : Text, startTime : Time.Time, endTime : ?Time.Time, recurrence : Recurrence) : async CalendarEntry {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create recurring entries");
    };

    await createCalendarEntry(title, description, startTime, endTime, ?recurrence, null);
  };

  public shared ({ caller }) func updateRecurringEntry(entryId : Nat, title : Text, description : Text, startTime : Time.Time, endTime : ?Time.Time, recurrence : Recurrence) : async ?CalendarEntry {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update recurring entries");
    };

    await updateCalendarEntry(entryId, title, description, startTime, endTime, ?recurrence, null);
  };

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

  public query ({ caller }) func getBudgetItems(user : Principal) : async [BudgetItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view budget items");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own budget items");
    };
    switch (budgetItems.get(user)) {
      case (null) { [] };
      case (?userItems) { userItems.toArray() };
    };
  };

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

  public query ({ caller }) func getCryptoPortfolio(user : Principal) : async [CryptoEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view crypto portfolios");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own crypto portfolio");
    };
    switch (cryptoPortfolios.get(user)) {
      case (null) { [] };
      case (?userEntries) { userEntries.toArray() };
    };
  };

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

  func addTaskToCalendar(user : Principal, task : Task, startTime : Time.Time, endTime : ?Time.Time, recurrence : ?Recurrence) {
    let entry : CalendarEntry = {
      id = task.id;
      title = task.description;
      description = task.description;
      startTime;
      endTime;
      taskId = ?task.id;
      recurrence;
    };

    let userEntries = switch (calendarEntries.get(user)) {
      case (null) { List.empty<CalendarEntry>() };
      case (?existing) { existing };
    };

    userEntries.add(entry);
    calendarEntries.add(user, userEntries);
  };

  func updateTaskInCalendar(user : Principal, task : Task) {
    let userEntries = switch (calendarEntries.get(user)) {
      case (null) { List.empty<CalendarEntry>() };
      case (?existing) { existing };
    };

    let updatedEntries = userEntries.map<CalendarEntry, CalendarEntry>(
      func(entry) {
        if (entry.taskId != null and entry.id == task.id) {
          {
            entry with
            title = task.description;
            description = task.description;
          };
        } else {
          entry;
        };
      }
    );

    calendarEntries.add(user, updatedEntries);
  };

  func deleteTaskFromCalendar(user : Principal, taskId : Nat) {
    let userEntries = switch (calendarEntries.get(user)) {
      case (null) { List.empty<CalendarEntry>() };
      case (?existing) { existing };
    };

    let filteredEntries = userEntries.filter(
      func(entry) { not (entry.taskId != null and entry.id == taskId) }
    );

    calendarEntries.add(user, filteredEntries);
  };

  func createTaskFromCalendarEntry(user : Principal, entry : CalendarEntry, title : Text, description : Text, dueDate : Time.Time) {
    let task : Task = {
      id = entry.id;
      description = title;
      completed = false;
      createdAt = Time.now();
      dueDate = ?dueDate;
      taskType = #daily;
    };

    let userTasks = switch (tasks.get(user)) {
      case (null) { List.empty<Task>() };
      case (?existing) { existing };
    };

    userTasks.add(task);
    tasks.add(user, userTasks);
  };

  func updateTaskFromCalendarEntry(user : Principal, entry : CalendarEntry, taskId : Nat) {
    let userTasks = switch (tasks.get(user)) {
      case (null) { List.empty<Task>() };
      case (?existing) { existing };
    };

    let updatedTasks = userTasks.map<Task, Task>(
      func(task) {
        if (task.id == taskId) {
          {
            task with
            description = entry.title;
            dueDate = ?entry.startTime;
          };
        } else {
          task;
        };
      }
    );

    tasks.add(user, updatedTasks);
  };

  func deleteTaskFromCalendarEntry(user : Principal, taskId : Nat) {
    let userTasks = switch (tasks.get(user)) {
      case (null) { List.empty<Task>() };
      case (?existing) { existing };
    };

    let filteredTasks = userTasks.filter(
      func(task) { task.id != taskId }
    );

    tasks.add(user, filteredTasks);
  };
};
