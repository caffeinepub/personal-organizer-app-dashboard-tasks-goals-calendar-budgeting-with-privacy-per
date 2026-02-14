import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BudgetItem {
    id: bigint;
    date: Time;
    description: string;
    itemType: BudgetItemType;
    amount: bigint;
}
export type Time = bigint;
export interface CalendarEntry {
    id: bigint;
    startTime: Time;
    title: string;
    endTime?: Time;
    description: string;
    recurrence?: Recurrence;
    taskId?: bigint;
}
export interface CryptoEntry {
    id: bigint;
    createdAt: Time;
    updatedAt: Time;
    currentPriceCents: bigint;
    amount: bigint;
    purchasePriceCents: bigint;
    symbol: string;
}
export interface Task {
    id: bigint;
    createdAt: Time;
    completed: boolean;
    dueDate?: Time;
    description: string;
    taskType: TaskType;
}
export type TaskType = {
    __kind__: "weekend";
    weekend: null;
} | {
    __kind__: "dayOfWeek";
    dayOfWeek: DayOfWeek;
} | {
    __kind__: "daily";
    daily: null;
};
export interface UserProfile {
    name: string;
}
export interface Goal {
    id: bigint;
    title: string;
    description: string;
    progress: bigint;
    targetDate?: Time;
}
export enum BudgetItemType {
    expense = "expense",
    income = "income"
}
export enum DayOfWeek {
    tuesday = "tuesday",
    wednesday = "wednesday",
    thursday = "thursday",
    friday = "friday",
    monday = "monday"
}
export enum Recurrence {
    monthly = "monthly",
    yearly = "yearly",
    daily = "daily",
    weekly = "weekly"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBudgetItem(amount: bigint, description: string, date: Time, itemType: BudgetItemType): Promise<BudgetItem>;
    createCalendarEntry(title: string, description: string, startTime: Time, endTime: Time | null, recurrence: Recurrence | null, taskId: bigint | null): Promise<CalendarEntry>;
    createCryptoEntry(symbol: string, amount: bigint, purchasePriceCents: bigint, currentPriceCents: bigint): Promise<CryptoEntry>;
    createGoal(title: string, description: string, targetDate: Time | null): Promise<Goal>;
    createRecurringEntry(title: string, description: string, startTime: Time, endTime: Time | null, recurrence: Recurrence): Promise<CalendarEntry>;
    createTask(description: string, dueDate: Time | null, taskType: TaskType): Promise<Task>;
    deleteBudgetItem(itemId: bigint): Promise<void>;
    deleteCalendarEntry(entryId: bigint): Promise<void>;
    deleteCryptoEntry(entryId: bigint): Promise<void>;
    deleteGoal(goalId: bigint): Promise<void>;
    deleteTask(taskId: bigint): Promise<void>;
    getBudgetItems(user: Principal): Promise<Array<BudgetItem>>;
    getCalendarEntries(user: Principal): Promise<Array<CalendarEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCryptoPortfolio(user: Principal): Promise<Array<CryptoEntry>>;
    getGoals(user: Principal): Promise<Array<Goal>>;
    getRecurringEntries(): Promise<Array<CalendarEntry>>;
    getTasks(user: Principal): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleTaskCompletion(taskId: bigint): Promise<Task | null>;
    updateBudgetItem(itemId: bigint, amount: bigint, description: string, date: Time, itemType: BudgetItemType): Promise<BudgetItem | null>;
    updateCalendarEntry(entryId: bigint, title: string, description: string, startTime: Time, endTime: Time | null, recurrence: Recurrence | null, taskId: bigint | null): Promise<CalendarEntry | null>;
    updateCryptoEntry(entryId: bigint, amount: bigint, purchasePriceCents: bigint, currentPriceCents: bigint): Promise<CryptoEntry | null>;
    updateGoal(goalId: bigint, title: string, description: string, targetDate: Time | null): Promise<Goal | null>;
    updateGoalProgress(goalId: bigint, progress: bigint): Promise<Goal | null>;
    updateRecurringEntry(entryId: bigint, title: string, description: string, startTime: Time, endTime: Time | null, recurrence: Recurrence): Promise<CalendarEntry | null>;
    updateTask(taskId: bigint, description: string, dueDate: Time | null, taskType: TaskType): Promise<Task | null>;
}
