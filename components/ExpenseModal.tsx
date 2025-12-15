"use client";

import { X, Settings } from "lucide-react";
import { useState, useEffect, useActionState, useTransition } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { addExpenseAction, updateExpense } from "@/lib/actions";
import CategoryManager from "@/components/CategoryManager";
import { toast } from "sonner";

interface Expense {
    id: string;
    amount: number;
    description: string | null;
    date: Date;
    categoryId?: string;
    category: string;
    type?: "EXPENSE" | "INCOME";
}

interface Category {
    id: string;
    name: string;
}

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense?: Expense | null;
    categories: Category[];
}

export default function ExpenseModal({ isOpen, onClose, expense, categories }: ExpenseModalProps) {
    const [isPending, startTransition] = useTransition();

    // Internal state for form values
    const [amount, setAmount] = useState("");

    const [categoryId, setCategoryId] = useState(""); // We need ID now
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
    const [error, setError] = useState("");
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    // Portal mount state
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize/Reset form
    useEffect(() => {
        if (isOpen) {
            if (expense) {
                setAmount(expense.amount.toString());

                // Need to find category ID match by name if expense only has name, 
                // but better if we pass full expense with relations.
                // For now, let's assume expense has name, find match in categories list
                const match = categories.find(c => c.name === expense.category);
                setCategoryId(match?.id || categories[0]?.id || "");
                setDate(format(new Date(expense.date), "yyyy-MM-dd"));
                setType(expense.type || "EXPENSE");
            } else {
                setAmount("");
                setCategoryId("");
                setDate(format(new Date(), "yyyy-MM-dd"));
                setType("EXPENSE");
            }
        }
    }, [isOpen, expense, categories]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Append explicit category ID logic or rely on select name="categoryName" vs "categoryId"??
        // Action expects category NAME for Create, and CategoryID for Update? 
        // Let's check actions. updateExpense uses fallback. addExpense uses name.
        // Let's pass 'category' name for both to be safe or pass ID.
        // Wait, action logic:
        // addExpenseAction: gets 'category' name.
        // updateExpense: gets 'amount', ..., 'categoryId'. if no categoryId, tries 'category' name.

        // Let's populate formData with selected category Name
        const selectedCat = categories.find(c => c.id === categoryId);
        if (selectedCat) {
            formData.set("category", selectedCat.name);
            formData.set("categoryId", selectedCat.id);
        }
        formData.set("type", type); // Explicitly set type

        startTransition(async () => {
            let result;
            if (expense) {
                result = await updateExpense(expense.id, formData);
            } else {
                result = await addExpenseAction(undefined, formData);
            }

            if (result?.message.includes("added") || result?.message.includes("updated")) {
                toast.success(result.message);
                onClose();
            } else {
                setError(result?.message || "Error saving expense");
                toast.error(result?.message || "Error saving expense");
            }
        });
    };

    if (!mounted) return null;

    return (
        <>
            {createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-neutral-800">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {expense ? (type === "EXPENSE" ? "Edit Expense" : "Edit Income") : "Add Transaction"}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Type Toggle */}
                            <div className="flex bg-gray-100 dark:bg-neutral-800 p-1 rounded-xl mb-4">
                                <button
                                    type="button"
                                    onClick={() => setType("EXPENSE")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === "EXPENSE" ? "bg-white dark:bg-neutral-700 text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("INCOME")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === "INCOME" ? "bg-white dark:bg-neutral-700 text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"}`}
                                >
                                    Income
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    name="description"
                                    type="text"
                                    defaultValue={expense?.description || ""}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    placeholder="What was this for?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowCategoryManager(true)}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                        >
                                            <Settings className="w-3 h-3" /> Manage
                                        </button>
                                    </div>
                                    <select
                                        name="categoryId"
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                    <input
                                        name="date"
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {isPending ? "Saving..." : (expense ? "Save Changes" : `Add ${type === "EXPENSE" ? "Expense" : "Income"}`)}
                                </button>
                                {error && (
                                    <p className="text-red-500 text-sm text-center mt-2">{error}</p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            <CategoryManager
                isOpen={showCategoryManager}
                onClose={() => setShowCategoryManager(false)}
                categories={categories}
            />
        </>
    );
}
