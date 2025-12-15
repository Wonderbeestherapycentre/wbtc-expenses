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
            const dayExpenses = expenses.filter(e => isSameDay(e.date, day));
            const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
            return {
                label: format(day, "EEE"), // Mon, Tue
                value: total,
                date: day
            };
        });
    }

    if (period === "month" || period === "last_month" || period === "custom" || period === "all") {
        // For custom/all, we might want dynamic buckets, but for now daily is safe if range isn't huge.
        // If range is unset, we can't easily do eachDayOfInterval without knowing boundaries.
        // BUT, MainChart is visual. `currentDate` is passed as `new Date()` usually.
        // For `last_month`, we need the actual range of expenses or relative to currentDate?
        // Actually page.tsx filters expenses. getChartData generates the X-axis labels.
        // If we use `eachDayOfInterval`, we need the correct start/end.

        let start = startOfMonth(currentDate);
        let end = endOfMonth(currentDate);

        if (period === "last_month") {
            // currentDate is usually "now", so we need to shift.
            // OR we can infer from expenses if mapped?
            // Safer: Just use the expenses' date range if available, or generate from filtered set.
            // Let's rely on expenses range for custom/all, and explicit calc for last_month.
            const lastMonthDate = new Date(currentDate);
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            start = startOfMonth(lastMonthDate);
            end = endOfMonth(lastMonthDate);
        } else if (period === "custom" || period === "all") {
            if (expenses.length === 0) return [];
            // Find min/max from expenses
            const sorted = [...expenses].sort((a, b) => a.date.getTime() - b.date.getTime());
            start = startOfDay(sorted[0].date);
            end = endOfDay(sorted[sorted.length - 1].date);
        }

        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dayExpenses = expenses.filter(e => isSameDay(e.date, day));
            const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
            return {
                label: format(day, "d MMM"),
                value: total,
                date: day,
            };
        });
    }

    if (period === "year") {
        // 12 months
        const months = Array.from({ length: 12 }, (_, i) => i);
        return months.map(m => {
            const date = new Date(currentDate.getFullYear(), m, 1);
            const monthExpenses = expenses.filter(e => isSameMonth(e.date, date));
            const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
            return {
                label: format(date, "MMM"),
                value: total,
                date: date
            };
        });
    }

    // Day view - maybe hourly? Or just list categories? 
    // Let's do hourly distribution if we had time data, but for now specific transactions or categories
    // Let's return categories for Day View
    const categories = Array.from(new Set(expenses.map(e => e.category)));
    return categories.map(cat => ({
        label: cat,
        value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    }));
}
