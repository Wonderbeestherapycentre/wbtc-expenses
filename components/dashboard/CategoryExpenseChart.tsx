"use client";

import { useState, useEffect } from "react";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategoryExpenseChartProps {
    data: Record<string, number>;
}

const COLORS = [
    "#EF4444", // Red - Primary for Expense
    "#F97316", // Orange
    "#EAB308", // Yellow
    "#84CC16", // Lime
    "#06B6D4", // Cyan
    "#3B82F6", // Blue
    "#8B5CF6", // Violet
    "#EC4899", // Pink
];

const CUSTOM_RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * CUSTOM_RADIAN);
    const y = cy + radius * Math.sin(-midAngle * CUSTOM_RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold drop-shadow-md pointer-events-none">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function CategoryExpenseChart({ data }: CategoryExpenseChartProps) {
    const chartData = Object.entries(data)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (chartData.length === 0) {
        return (
            <div className="glass-card p-6 rounded-2xl h-[400px] flex items-center justify-center text-gray-400">
                No expense data available for this period
            </div>
        );
    }

    return (
        <div className="glass-card p-2 md:p-6 rounded-2xl h-[400px] animate-fade-in animate-delay-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Expense Source</h3>
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={isMobile ? 80 : 100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend
                            layout={isMobile ? "horizontal" : "vertical"}
                            verticalAlign={isMobile ? "bottom" : "middle"}
                            align={isMobile ? "center" : "right"}
                            wrapperStyle={{ fontSize: "12px" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
