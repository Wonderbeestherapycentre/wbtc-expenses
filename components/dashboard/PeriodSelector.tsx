"use client";

import { useExpenses } from "@/lib/context";
import { Period } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function PeriodSelector() {
    const { period, setPeriod } = useExpenses();
    const periods: Period[] = ["day", "week", "month", "year"];

    return (
        <div className="bg-white dark:bg-neutral-900 p-1 rounded-xl border border-gray-200 dark:border-neutral-800 inline-flex">
            {periods.map((p) => (
                <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                        "relative px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors z-10",
                        period === p ? "text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    )}
                >
                    {period === p && (
                        <motion.div
                            layoutId="period-indicator"
                            className="absolute inset-0 bg-gray-900 dark:bg-blue-600 rounded-lg -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    {p}
                </button>
            ))}
        </div>
    );
}
