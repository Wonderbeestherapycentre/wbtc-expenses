"use client";

import { X, Receipt, Calendar, User, Tag, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";

interface Expense {
    id: string;
    description: string | null;
    amount: number;
    date: Date;
    category: string;
    type: "EXPENSE" | "INCOME";
    user?: {
        name: string;
        color?: string | null;
    } | null;
}

interface ExpenseDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense: Expense | null;
}

export default function ExpenseDetailsModal({ isOpen, onClose, expense }: ExpenseDetailsModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen || !expense) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-neutral-800 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-blue-600" />
                        Transaction Details
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Amount & Type */}
                    <div className="text-center p-6 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-2 uppercase tracking-wide ${expense.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {expense.type === "INCOME" ? "Income" : "Expense"}
                        </span>
                        <h3 className={`text-4xl font-bold ${expense.type === "INCOME" ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
                            {expense.type === "INCOME" ? "+" : "-"}${Number(expense.amount).toFixed(2)}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {/* Member */}
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Member</p>
                                <p className="font-medium text-gray-900 dark:text-white">{expense.user?.name || "Unknown"}</p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                                <p className="font-medium text-gray-900 dark:text-white">{format(new Date(expense.date), "dd MMM yy").toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <Tag className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Category</p>
                                <p className="font-medium text-gray-900 dark:text-white">{expense.category}</p>
                            </div>
                        </div>

                        {/* Description */}
                        {expense.description && (
                            <div className="flex items-start gap-4 p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Description</p>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                        {expense.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
