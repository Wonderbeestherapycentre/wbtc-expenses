export type Period = "day" | "week" | "month" | "last_month" | "year" | "custom" | "all";

export interface User {
    id: string;
    name: string;
    avatar?: string;
    color: string;
}

export interface Expense {
    id: string;
    amount: number;
    date: Date;
    description: string | null;
    category: string;
    userId: string;
}

export interface ExpenseSummary {
    total: number;
    byCategory: Record<string, number>;
    byUser: Record<string, number>;
}
