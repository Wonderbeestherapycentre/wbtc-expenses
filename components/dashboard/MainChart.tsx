"use client";

import { Box } from "lucide-react"; // Fallback icon?
import { getChartData } from "@/lib/analytics";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { Expense } from "@/lib/types";

import { Period } from "@/lib/types";

interface MainChartProps {
    expenses: Expense[];
    period?: string;
}

export default function MainChart({ expenses, period = "month" }: MainChartProps) {
    // period is passed from parent now
    const currentDate = new Date();

    const data = useMemo(() => getChartData(expenses, period as Period, currentDate), [expenses, period]);

    return (
        <div className="glass-card p-6 rounded-2xl h-[400px] animate-fade-in animate-delay-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Spending Activity</h3>
            </div>

            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(val: number) => [formatCurrency(val), "Spent"]}
                        />
                        <Bar
                            dataKey="value"
                            fill="#4f46e5" /* Primary color */
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div >
    );
}
