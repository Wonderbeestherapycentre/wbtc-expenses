"use client";

import { useExpenses } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { User as UserIcon } from "lucide-react";

import { filterExpensesByPeriod } from "@/lib/analytics";

export default function RecentExpenses() {
    const { expenses, users, period, currentDate } = useExpenses();

    const filtered = filterExpensesByPeriod(expenses, period, currentDate);
    // Take last 5 of filtered
    const recent = [...filtered].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    const getUser = (id: string) => users.find(u => u.id === id);

    return (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            </div>
            <div className="flex-1 p-2">
                {recent.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">No expenses yet</div>
                ) : (
                    <div className="space-y-1">
                        {recent.map(expense => {
                            const user = getUser(expense.userId);
                            return (
                                <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-lg">
                                            {/* Category Icon mappings could go here, using emoji for now */}
                                            <span>🛒</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.description}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500">{format(expense.date, "dd MMM yy").toUpperCase()}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-400">
                                                    {user?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        -{formatCurrency(expense.amount)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
