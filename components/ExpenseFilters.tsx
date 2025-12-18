"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

interface Category {
    id: string;
    name: string;
}

interface ExpenseFiltersProps {
    categories: Category[];
    showTypeFilter?: boolean;
}

export default function ExpenseFilters({ categories, showTypeFilter = true }: ExpenseFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get("category") || "all";
    const currentPeriod = searchParams.get("period") || "all";
    const currentFrom = searchParams.get("from") || "";
    const currentTo = searchParams.get("to") || "";

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === "all" || value === "") {
            params.delete(key);
            if (key === "period") {
                params.delete("from");
                params.delete("to");
            }
        } else {
            params.set(key, value);
        }

        // Reset pagination when filtering
        params.delete("page");

        router.push(`/expenses?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-neutral-900 p-2 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm mb-6 transition-all duration-300">
            <div className="flex items-center px-3 text-gray-500 dark:text-gray-400">
                <Filter className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Filter</span>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-neutral-800 hidden sm:block"></div>

            <select
                value={currentPeriod}
                onChange={(e) => handleFilterChange("period", e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border-none rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none min-w-[120px]"
            >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="year">This Year</option>
                <option value="last_year">Last Year</option>
                <option value="custom">Custom Range</option>
            </select>

            {currentPeriod === "custom" && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <input
                        type="date"
                        value={currentFrom}
                        onChange={(e) => handleFilterChange("from", e.target.value)}
                        className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border-none rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        value={currentTo}
                        onChange={(e) => handleFilterChange("to", e.target.value)}
                        className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border-none rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            )}

            {showTypeFilter && (
                <select
                    value={searchParams.get("type") || "all"}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border-none rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none min-w-[120px]"
                >
                    <option value="all">All Types</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                    <option value="DUE">Due</option>
                </select>
            )}

            <select
                value={currentCategory}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border-none rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none min-w-[150px]"
            >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
