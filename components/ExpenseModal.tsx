"use client";


import { X } from "lucide-react";
import { useState, useEffect, useActionState, useTransition } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { addExpenseAction, updateExpense } from "@/lib/actions";
import { toast } from "sonner";
import SearchableSelect from "./SearchableSelect";

interface Expense {
    id: string;
    amount: number;
    description?: string | null;
    date: string | Date; // Allow string (ISO) or Date object
    category?: string; // Could be ID or name depending on usage, usually ID in this app context? No, mapped to name in some places. Let's allow string.
    categoryId?: string;
    childId?: string | null;
    type?: "EXPENSE" | "INCOME" | "DUE";
}

// ... imports

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense?: Expense | null;
    categories?: { id: string; name: string }[];
    familyChildren?: { id: string; name: string; status?: string }[];
    defaultType?: "EXPENSE" | "INCOME" | "DUE";
    defaultChildId?: string;
}

export default function ExpenseModal({ isOpen, onClose, expense, categories = [], familyChildren = [], defaultType = "EXPENSE", defaultChildId = "" }: ExpenseModalProps) {
    const activeChildren = familyChildren.filter(c => c.status !== "INACTIVE");

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Internal state for form values
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [type, setType] = useState<"EXPENSE" | "INCOME" | "DUE">("EXPENSE");
    const [categoryId, setCategoryId] = useState("");
    const [childId, setChildId] = useState("");

    // Portal mount state
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize/Reset form
    useEffect(() => {
        if (isOpen) {
            setError(null); // Clear any previous errors
            if (expense) {
                setAmount(expense.amount.toString());
                setDescription(expense.description || "");
                setDate(format(new Date(expense.date), "yyyy-MM-dd"));
                setType(expense.type || "EXPENSE");

                // Map category name/ID to actual ID from options
                const catMatch = categories.find(c => c.id === expense.categoryId || c.name === expense.category);
                setCategoryId(catMatch ? catMatch.id : "");

                setChildId(expense.childId || "");
            } else {
                setAmount("");
                setDescription("");
                setDate(format(new Date(), "yyyy-MM-dd"));
                setType(defaultType);
                setCategoryId("");
                setChildId(defaultChildId);
            }
        }
    }, [isOpen, expense, categories, defaultType, defaultChildId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("type", type); // Explicitly set type

        // Ensure childId is set if selected
        if (childId) formData.set("childId", childId);

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
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-neutral-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
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
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === "EXPENSE" ? "bg-white dark:bg-neutral-700 text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"} `}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("INCOME")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === "INCOME" ? "bg-white dark:bg-neutral-700 text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"} `}
                                >
                                    Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType("DUE")}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === "DUE" ? "bg-white dark:bg-neutral-700 text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"} `}
                                >
                                    Due
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

                            {/* Category Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select
                                    name="categoryId"
                                    value={categoryId}
                                    required
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Child Select (Optional) - Only for Expenses? */}
                            {(type === "INCOME" || type === "DUE") && activeChildren.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Child <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <SearchableSelect
                                        options={activeChildren}
                                        value={childId}
                                        onChange={setChildId}
                                        placeholder="Select Child"
                                    />
                                    {/* Hidden input for form submission if needed, but we handle it in state. 
                                        However, if we want formData to work automatically without manual append, we might need a hidden input.
                                        But handleSubmit constructs formData manually or uses useActionState. 
                                        Let's check handleSubmit.
                                        It uses new FormData(e.currentTarget).
                                        So we either need a hidden input with name="childId" or append it manually.
                                        SearchableSelect has a hidden input? Let's check.
                                        Yes, SearchableSelect has a hidden input but it doesn't have a name prop passed to it yet.
                                        I should verify SearchableSelect again or just manual append in handleSubmit.
                                        Let's manual append in handleSubmit to be safe as I did comment out that logic earlier.
                                    */}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                                <input
                                    name="description"
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    placeholder="What was this for?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                    {isPending ? "Saving..." : (expense ? "Save Changes" : `Add ${type === "EXPENSE" ? "Expense" : type === "INCOME" ? "Income" : "Due"} `)}
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
        </>
    );
}

