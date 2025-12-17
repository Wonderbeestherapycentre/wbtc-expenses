"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { markDueAsPaid } from "@/lib/actions";
import { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface DueListProps {
    expenses: Expense[];
}

export default function DueList({ expenses }: DueListProps) {
    const [isPending, startTransition] = useTransition();

    const dueExpenses = expenses.filter(e => e.type === "DUE");

    const handleMarkAsPaid = (id: string) => {
        startTransition(async () => {
            const result = await markDueAsPaid(id);
            if (result.message.includes("marked as paid")) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    if (dueExpenses.length === 0) {
        return (
            <div className="glass-card p-6 rounded-2xl h-full flex flex-col items-center justify-center text-gray-400 min-h-[300px]">
                <Clock className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-700" />
                <p>No due payments</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-2xl h-full animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Due Payments
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {dueExpenses.map((expense) => (
                    <div
                        key={expense.id}
                        className="p-4 rounded-xl bg-gray-50/50 dark:bg-neutral-800/30 border border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(expense.amount)}
                                    </span>
                                    {expense.childName && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            {expense.childName}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-0.5">
                                    <span>{expense.description || expense.category}</span>
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(expense.date), "MMM d, yyyy")}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleMarkAsPaid(expense.id)}
                                disabled={isPending}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                                title="Mark as Paid"
                            >
                                <CheckCircle2 className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
