"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Edit2, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { deleteExpense } from "@/lib/actions";
import ExpenseModal from "@/components/ExpenseModal";
import ConfirmModal from "@/components/ConfirmModal";
import ExpenseDetailsModal from "@/components/ExpenseDetailsModal";

interface Expense {
    id: string;
    description: string | null;
    amount: number;
    date: Date;
    category: string;
    type: "EXPENSE" | "INCOME" | "DUE";
    childName?: string | null;
    staffName?: string | null;
    user?: {
        name: string;
        color?: string | null;
    } | null;
}

interface ExpenseListProps {
    expenses: Expense[];
    categories: { id: string; name: string; isSystem?: boolean }[];
    familyChildren?: { id: string; name: string; status?: string }[];
    familyStaffs?: { id: string; name: string; status?: string }[];
    defaultChildId?: string;
    defaultStaffId?: string;
}

export default function ExpenseList({ expenses, categories, familyChildren = [], familyStaffs = [], defaultChildId, defaultStaffId }: ExpenseListProps) {
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<{ id: string; type: string; category: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleDeleteClick = (id: string, type: string, category: string) => {
        setDeletingExpense({ id, type, category });
    };

    const handleConfirmDelete = () => {
        if (!deletingExpense) return;

        startTransition(async () => {
            const result = await deleteExpense(deletingExpense.id);
            setDeletingExpense(null);

            if (result?.message?.includes("deleted")) {
                toast.success("Expense deleted successfully");
            } else {
                toast.error(result?.message || "Failed to delete expense");
            }
        });
    };

    return (
        <>
            <ExpenseModal
                isOpen={!!editingExpense}
                onClose={() => setEditingExpense(null)}
                expense={editingExpense}
                categories={categories}
                familyChildren={familyChildren}
                familyStaffs={familyStaffs}
            />

            <ExpenseModal
                isOpen={isAddExpenseOpen}
                onClose={() => setIsAddExpenseOpen(false)}
                categories={categories}
                familyChildren={familyChildren}
                familyStaffs={familyStaffs}
                defaultChildId={defaultChildId}
                defaultStaffId={defaultStaffId}
            />

            <ExpenseDetailsModal
                isOpen={!!viewingExpense}
                onClose={() => setViewingExpense(null)}
                expense={viewingExpense}
            />

            <ConfirmModal
                isOpen={!!deletingExpense}
                onClose={() => setDeletingExpense(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Expense"
                description={`Are you sure you want to delete this ${deletingExpense?.type === 'INCOME' ? 'Income' : 'Expense'} - ${deletingExpense?.category}? This action cannot be undone.`}
                confirmLabel="Delete"
                isPending={isPending}
            />

            <div className="glass-card rounded-2xl overflow-hidden animate-fade-in p-4 md:p-6">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transactions</h3>
                    <button
                        onClick={() => setIsAddExpenseOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                    >
                        <span>Add Expense</span>
                    </button>
                </div>
                <div className="overflow-x-auto -mx-4 px-4 md:-mx-6 md:px-6 pb-4">
                    <table className="w-full md:min-w-[800px]">
                        <thead className="bg-gray-50/50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                            <tr>
                                <th className="text-left py-1 px-1 md:py-2 md:px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="hidden md:table-cell text-left py-1 px-3 md:py-2 md:px-6 text-xs font-semibold text-gray-500 uppercase">
                                    {defaultChildId ? "Child" : defaultStaffId ? "Staff" : "Child / Staff"}
                                </th>

                                <th className="hidden md:table-cell text-left py-1 px-3 md:py-2 md:px-6 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                <th className="md:hidden text-left py-1 px-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
                                <th className="text-left py-1 px-1 md:py-2 md:px-6 text-xs font-semibold text-gray-500 uppercase">amount</th>
                                <th className="hidden md:table-cell text-left py-1 px-3 md:py-2 md:px-6 text-xs font-semibold text-gray-500 uppercase">Description</th>
                                <th className="text-right py-1 px-1 md:py-2 md:px-6 text-xs font-semibold text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">No transactions found.</td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="py-1 px-1 md:py-2 md:px-6 text-sm text-gray-500" suppressHydrationWarning>
                                            <span className="md:hidden">{format(new Date(expense.date), "dd MMM yy").toUpperCase()}</span>
                                            <span className="hidden md:inline">{format(new Date(expense.date), "dd MMM yy").toUpperCase()}</span>
                                        </td>
                                        <td className="hidden md:table-cell py-1 px-3 md:py-2 md:px-6">
                                            {expense.childName ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800">
                                                    {expense.childName}
                                                </span>
                                            ) : expense.staffName ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
                                                    {expense.staffName}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>

                                        <td className="hidden md:table-cell py-1 px-3 md:py-2 md:px-6">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="md:hidden py-1 px-3">
                                            <div className="flex flex-col items-start gap-1">
                                                {expense.childName ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800">
                                                        {expense.childName}
                                                    </span>
                                                ) : expense.staffName ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
                                                        {expense.staffName}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}

                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                    {expense.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={`py-1 px-1 md:py-2 md:px-6 font-bold whitespace-nowrap ${expense.type === "INCOME" ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
                                            {expense.type === "INCOME" ? "+" : "-"}₹{Number(expense.amount).toFixed(2)}
                                        </td>
                                        <td className="hidden md:table-cell py-1 px-3 md:py-2 md:px-6 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={expense.description || ""}>
                                            {expense.description || "-"}
                                        </td>
                                        <td className="py-1 px-1 md:py-2 md:px-6 text-right">
                                            <div className="flex items-center justify-end gap-1 md:gap-2">
                                                <button
                                                    onClick={() => setViewingExpense(expense)}
                                                    className="p-1 md:p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingExpense(expense)}
                                                    className="p-1 md:p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(expense.id, expense.type, expense.category)}
                                                    disabled={isPending}
                                                    className="p-1 md:p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
        </>
    );
}
