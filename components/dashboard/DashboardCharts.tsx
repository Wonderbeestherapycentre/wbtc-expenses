"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DashboardChartsProps {
    stats: {
        incomeByMember: Record<string, number>;
        expenseByMember: Record<string, number>; 
    };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function DashboardCharts({ stats }: DashboardChartsProps) {
    const incomeData = Object.entries(stats.incomeByMember).map(([name, value]) => ({
        name,
        value,
    }));

    const expenseData = Object.entries(stats.expenseByMember).map(([name, value]) => ({
        name,
        value,
    }));

    if (incomeData.length === 0 && expenseData.length === 0) {
        return null;
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-neutral-800 p-2 border border-gray-100 dark:border-neutral-700 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ${Number(payload[0].value).toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderChart = (title: string, data: any[]) => (
        <div className="glass-card p-6 rounded-2xl animate-fade-in">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
            <div className="h-[300px] w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        No data available
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderChart("Income by Member", incomeData)}
            {renderChart("Expenses by Member", expenseData)}
        </div>
    );
}
