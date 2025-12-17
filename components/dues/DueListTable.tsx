"use client";

import { useTransition, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { markDueAsPaid, deleteExpense } from "@/lib/actions"; // Reuse deleteExpense?
import { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import ConfirmModal from "@/components/ConfirmModal";
// We might want to allow editing too (reuse ExpenseModal?), but for now focused on List & Pay.

interface DueListTableProps {
    expenses: Expense[];
}

export default function DueListTable({ expenses }: DueListTableProps) {
    const [isPending, startTransition] = useTransition();
    const [confirmPayId, setConfirmPayId] = useState<string | null>(null);

    const handleMarkAsPaid = () => {
        if (!confirmPayId) return;

        startTransition(async () => {
            const result = await markDueAsPaid(confirmPayId);
            setConfirmPayId(null);
            if (result.message.includes("marked as paid")) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in p-4 md:p-6">
            <ConfirmModal
                isOpen={!!confirmPayId}
                onClose={() => setConfirmPayId(null)}
                onConfirm={handleMarkAsPaid}
                title="Confirm Payment"
                description="Are you sure you want to mark this due amount as received? It will be converted to Income."
                confirmLabel="Confirm Added to Income"
                isPending={isPending}
            />

            <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Pending Dues
                </h3>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 md:-mx-6 md:px-6 pb-4">
                <table className="w-full md:min-w-[800px]">
                    <thead className="bg-gray-50/50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                        <tr>
                            <th className="text-left py-3 px-1 md:py-4 md:px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th className="hidden md:table-cell text-left py-3 px-3 md:py-4 md:px-6 text-xs font-semibold text-gray-500 uppercase">Child</th>
                            <th className="hidden md:table-cell text-left py-3 px-3 md:py-4 md:px-6 text-xs font-semibold text-gray-500 uppercase">Category</th>
                            <th className="md:hidden text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
                            <th className="text-left py-3 px-1 md:py-4 md:px-6 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            <th className="hidden md:table-cell text-left py-3 px-3 md:py-4 md:px-6 text-xs font-semibold text-gray-500 uppercase">Description</th>
                            <th className="text-right py-3 px-1 md:py-4 md:px-6 text-xs font-semibold text-gray-500 uppercase">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Clock className="w-12 h-12 mb-3 text-gray-200 dark:text-gray-800" />
                                        <p>No due payments found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                                    <td className="py-3 px-1 md:py-4 md:px-6 text-sm text-gray-500">
                                        <span className="md:hidden">{format(new Date(expense.date), "dd MMM").toUpperCase()}</span>
                                        <span className="hidden md:inline">{format(new Date(expense.date), "dd MMM yyyy").toUpperCase()}</span>
                                    </td>

                                    <td className="hidden md:table-cell py-3 px-3 md:py-4 md:px-6">
                                        {expense.childName ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                {expense.childName}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="hidden md:table-cell py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900 dark:text-white">
                                        {expense.category}
                                    </td>

                                    <td className="md:hidden py-3 px-3">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                {expense.category}
                                            </span>
                                            {expense.childName && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                    {expense.childName}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="py-3 px-1 md:py-4 md:px-6 font-bold whitespace-nowrap text-orange-600">
                                        {formatCurrency(expense.amount)}
                                    </td>
                                    <td className="hidden md:table-cell py-3 px-3 md:py-4 md:px-6 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={expense.description || ""}>
                                        {expense.description || "-"}
                                    </td>
                                    <td className="py-3 px-1 md:py-4 md:px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setConfirmPayId(expense.id)}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                                                title="Mark as Paid"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span className="hidden md:inline">Confirm Income</span>
                                                <span className="md:hidden">Pay</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
