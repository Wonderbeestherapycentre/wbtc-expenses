"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, IndianRupee, Tags, Users, Plus, X, Baby, Clock, Briefcase } from "lucide-react";

import { cn } from "@/lib/utils";
import UserSwitcher from "./UserSwitcher";
import Link from "next/link";


interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onAddExpense: () => void;
}

export default function Sidebar({ isOpen, onClose, onAddExpense }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: pathname === "/dashboard" },
        { icon: IndianRupee, label: "All Expenses", href: "/expenses" },
        { icon: Baby, label: "Childrens", href: "/childrens" },
        { icon: Briefcase, label: "Staffs", href: "/staffs" },
        { icon: Clock, label: "Due List", href: "/dues" },
        { icon: Tags, label: "Categories", href: "/categories" },
        { icon: Users, label: "Users", href: "/users" },
    ];



    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } flex flex-col overflow-y-auto`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-blue-500/20 shadow-lg">
                                <IndianRupee className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
                                    VR FinTrack
                                </h1>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-6 py-4">
                        <button
                            onClick={onAddExpense}
                            className="group flex items-center justify-center w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <span className="bg-white/20 p-1 rounded-lg mr-3 group-hover:bg-white/30 transition-colors">
                                <Plus className="w-4 h-4" />
                            </span>
                            Add Expense
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                                        isActive
                                            ? "text-blue-600 bg-blue-50 dark:bg-blue-900/10"
                                            : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-gray-200"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                                    )}
                                    <item.icon className={cn(
                                        "w-5 h-5 mr-3 transition-colors",
                                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                    )} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / User Profile */}
                    <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50">
                        <UserSwitcher />
                    </div>
                </div>
            </aside>
        </>
    );
}
