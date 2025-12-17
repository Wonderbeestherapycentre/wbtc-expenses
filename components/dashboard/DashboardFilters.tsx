"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter } from "lucide-react";

export default function DashboardFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPeriod = searchParams.get("period") || "all";
    const currentFrom = searchParams.get("from") || "";
    const currentTo = searchParams.get("to") || "";

    const updateFilter = (key: string, value: string) => {
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
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-neutral-900 p-1.5 rounded-lg border border-gray-100 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center px-2 text-gray-400">
                <Filter className="w-4 h-4" />
            </div>

            <select
                value={currentPeriod}
                onChange={(e) => updateFilter("period", e.target.value)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-neutral-800 border-none rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none min-w-[140px]"
            >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="week">This Week</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
            </select>

            {currentPeriod === "custom" && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <input
                        type="date"
                        value={currentFrom}
                        onChange={(e) => updateFilter("from", e.target.value)}
                        className="px-3 py-1.5 bg-gray-50 dark:bg-neutral-800 border-none rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="date"
                        value={currentTo}
                        onChange={(e) => updateFilter("to", e.target.value)}
                        className="px-3 py-1.5 bg-gray-50 dark:bg-neutral-800 border-none rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            )}
        </div>
    );
}
