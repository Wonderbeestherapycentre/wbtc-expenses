"use client";

import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Wallet, CreditCard, Users, UserX, Clock } from "lucide-react";

interface StatsGridProps {
    stats: {
        totalExpenses: number;
        totalIncome: number;
        balance: number;
        dueCount?: number;
        totalDue?: number;
        byCategory: Record<string, number>;
    };
    period?: string;
    childStats?: {
        active: number;
        inactive: number;
    };
}

export default function StatsGrid({ stats, period = "month", childStats }: StatsGridProps) {
    // Find top category
    const topCategoryEntry = Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a)[0];
    const topCategory = topCategoryEntry ? topCategoryEntry[0] : "N/A";

    const cards = [
        {
            label: "Total Income",
            value: formatCurrency(stats.totalIncome),
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-900/20",
        },
        {
            label: "Total Expenses",
            value: formatCurrency(stats.totalExpenses),
            icon: Wallet,
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-900/20",
        },
        {
            label: "Balance",
            value: formatCurrency(stats.balance),
            icon: CreditCard,
            color: stats.balance >= 0 ? "text-blue-600" : "text-red-600",
            bg: stats.balance >= 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-red-50 dark:bg-red-900/20",
        }
    ];

    if (stats.dueCount !== undefined) {
        cards.push({
            label: "Pending Dues",
            value: formatCurrency(stats.totalDue || 0),
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-900/20",
        });
    }

    if (childStats) {
        cards.push({
            label: "Active Children",
            value: childStats.active.toString(),
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
        });
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4 gap-2">
            {cards.map((card, i) => (
                <div
                    key={card.label}
                    className="glass-card p-2 rounded-2xl flex items-center animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <div className={`p-1 rounded-xl ${card.bg} mr-2`}>
                        <card.icon className={`md:w-6 md:h-6 w-4 h-4 ${card.color}`} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                        <h3 className="md:text-xl text-md font-bold text-gray-900 dark:text-white mt-1">{card.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
