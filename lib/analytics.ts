import { Expense, Period } from "./types";
import {
    isSameDay,
    isSameWeek,
    isSameMonth,
    isSameYear,
    startOfDay,
    startOfWeek,
    startOfMonth,
    startOfYear,
    eachDayOfInterval,
    endOfWeek,
    endOfMonth,
    format,
    endOfDay
} from "date-fns";

export function filterExpensesByPeriod(expenses: Expense[], period: Period, date: Date): Expense[] {
    return expenses.filter((expense) => {
        switch (period) {
            case "day":
                return isSameDay(expense.date, date);
            case "week":
                return isSameWeek(expense.date, date, { weekStartsOn: 1 });
            case "month":
                return isSameMonth(expense.date, date);
            case "year":
                return isSameYear(expense.date, date);
            default:
                return true;
        }
    });
}

export function calculateStats(expenses: Expense[]) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byUser = expenses.reduce((acc, e) => {
        acc[e.userId] = (acc[e.userId] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const byCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    return { total, byUser, byCategory };
}

// Prepare data for Recharts
export function getChartData(expenses: Expense[], period: Period, currentDate: Date) {
    // Logic depends on period. 
    // If Week: Show days (Mon, Tue...)
    // If Month: Show days (1, 2, 3...) or Weeks
    // If Year: Show months (Jan, Feb...)

    if (period === "week") {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dayItems = expenses.filter(e => isSameDay(e.date, day));
            const income = dayItems.filter(e => e.type === "INCOME").reduce((sum, e) => sum + e.amount, 0);
            const expense = dayItems.filter(e => e.type === "EXPENSE").reduce((sum, e) => sum + e.amount, 0);
            return {
                label: format(day, "EEE"), // Mon, Tue
                income,
                expense,
                date: day
            };
        });
    }

    if (period === "month" || period === "last_month" || period === "custom" || period === "all") {
        let start = startOfMonth(currentDate);
        let end = endOfMonth(currentDate);

        if (period === "last_month") {
            const lastMonthDate = new Date(currentDate);
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            start = startOfMonth(lastMonthDate);
            end = endOfMonth(lastMonthDate);
        } else if (period === "custom" || period === "all") {
            if (expenses.length === 0) return [];
            const sorted = [...expenses].sort((a, b) => a.date.getTime() - b.date.getTime());
            start = startOfDay(sorted[0].date);
            end = endOfDay(sorted[sorted.length - 1].date);
        }

        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dayItems = expenses.filter(e => isSameDay(e.date, day));
            const income = dayItems.filter(e => e.type === "INCOME").reduce((sum, e) => sum + e.amount, 0);
            const expense = dayItems.filter(e => e.type === "EXPENSE").reduce((sum, e) => sum + e.amount, 0);
            return {
                label: format(day, "d MMM"),
                income,
                expense,
                date: day,
            };
        });
    }

    if (period === "year") {
        const months = Array.from({ length: 12 }, (_, i) => i);
        return months.map(m => {
            const date = new Date(currentDate.getFullYear(), m, 1);
            const monthItems = expenses.filter(e => isSameMonth(e.date, date));
            const income = monthItems.filter(e => e.type === "INCOME").reduce((sum, e) => sum + e.amount, 0);
            const expense = monthItems.filter(e => e.type === "EXPENSE").reduce((sum, e) => sum + e.amount, 0);
            return {
                label: format(date, "MMM"),
                income,
                expense,
                date: date
            };
        });
    }

    // Day view - Breakdown by Category
    const categories = Array.from(new Set(expenses.map(e => e.category)));
    return categories.map(cat => {
        const catItems = expenses.filter(e => e.category === cat);
        const income = catItems.filter(e => e.type === "INCOME").reduce((sum, e) => sum + e.amount, 0);
        const expense = catItems.filter(e => e.type === "EXPENSE").reduce((sum, e) => sum + e.amount, 0);
        return {
            label: cat,
            income,
            expense
        }
    });
}
