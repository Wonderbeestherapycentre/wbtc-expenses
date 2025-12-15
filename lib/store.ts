import { Expense, User } from "./types";
import { subDays, subMonths, startOfDay } from "date-fns";

export const USERS: User[] = [
    { id: "1", name: "Alice", color: "#3b82f6" }, // blue
    { id: "2", name: "Bob", color: "#ef4444" },   // red
    { id: "3", name: "Charlie", color: "#10b981" }, // green
];

export const CATEGORIES = [
    "Food",
    "Transport",
    "Utilities",
    "Entertainment",
    "Health",
    "Shopping",
    "Other",
];

// Generate some mock expenses
const generateMockExpenses = (): Expense[] => {
    const expenses: Expense[] = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
        const user = USERS[Math.floor(Math.random() * USERS.length)];
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const daysAgo = Math.floor(Math.random() * 60); // Last 60 days
        const date = subDays(now, daysAgo);

        expenses.push({
            id: crypto.randomUUID(),
            amount: Math.floor(Math.random() * 100) + 5,
            date: date,
            description: `${category} purchase`,
            category,
            userId: user.id,
            type: "EXPENSE",
        });
    }
    return expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Simple in-memory store (reset on reload)
// In a real app, this would use a Context or Zustand store with persistence
class Store {
    expenses: Expense[];
    currentUser: User;

    constructor() {
        this.expenses = generateMockExpenses();
        this.currentUser = USERS[0];
    }

    addExpense(expense: Omit<Expense, "id">) {
        const newExpense: Expense = {
            ...expense,
            id: crypto.randomUUID(),
        };
        this.expenses = [newExpense, ...this.expenses];
        return newExpense;
    }

    getExpenses() {
        return this.expenses;
    }

    getUsers() {
        return USERS;
    }
}

export const store = new Store();
