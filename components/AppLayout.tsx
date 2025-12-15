"use client";

import React, { useState } from "react";
import { useExpenses } from "@/lib/context";
import { Menu, X, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import ExpenseModal from "./ExpenseModal";

interface Category {
    id: string;
    name: string;
}

export default function AppLayout({ children, categories = [] }: { children: React.ReactNode; categories?: Category[] }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const { currentUser } = useExpenses();



    return (
        <div className="h-screen overflow-hidden flex flex-col md:flex-row">
            <ExpenseModal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} categories={categories} />

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-blue-500/20 shadow-lg">
                        <Receipt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
                            VR Expense
                        </h1>
                        <span className="text-xs font-medium text-gray-400 tracking-wide">Tracker</span>
                    </div>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800">
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar (Desktop) / Drawer (Mobile) */}
            <Sidebar
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                onAddExpense={() => setIsAddExpenseOpen(true)}
            />

            <main className="flex-1 overflow-y-auto p-2 md:p-8 bg-gray-50/50 dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
