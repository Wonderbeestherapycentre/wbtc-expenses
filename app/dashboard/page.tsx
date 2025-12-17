import AppLayout from "@/components/AppLayout";
import StatsGrid from "@/components/dashboard/StatsGrid";
import MainChart from "@/components/dashboard/MainChart";
import RecentExpenses from "@/components/dashboard/RecentExpenses";

import DashboardFilters from "@/components/dashboard/DashboardFilters";
import CategoryIncomeChart from "@/components/dashboard/CategoryIncomeChart";
import DueList from "@/components/dashboard/DueList";
import { auth } from "@/auth";
import { fetchExpenses, fetchStats, fetchCategories, fetchChildren } from "@/lib/data";

import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, startOfDay, endOfDay, format } from "date-fns";

export default async function Home({ searchParams }: { searchParams: any }) {
    const session = await auth();
    const params = await searchParams;
    const period = typeof params?.period === 'string' ? params.period : undefined;
    const from = typeof params?.from === 'string' ? params.from : undefined;
    const to = typeof params?.to === 'string' ? params.to : undefined;

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    const now = new Date();

    if (period === "month") {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    } else if (period === "last_month") {
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
    } else if (period === "week") {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else if (period === "year") {
        startDate = startOfYear(now);
        endDate = endOfYear(now);
    } else if (period === "custom") {
        if (from) startDate = startOfDay(new Date(from));
    }

    const stats = await fetchStats(startDate, endDate);
    const categories = await fetchCategories();
    const children = await fetchChildren(true); // Fetch all children to count active/inactive

    const activeChildCount = children.filter(c => c.status === "ACTIVE").length;
    const inactiveChildCount = children.filter(c => c.status === "INACTIVE").length;

    const { data: expenses } = await fetchExpenses(undefined, { startDate, endDate });

    return (
        <AppLayout categories={categories} familyChildren={children}>
            <div className="space-y-8 animate-fade-in">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Welcome back, {session?.user?.name}
                        </p>
                    </div>
                    <DashboardFilters />
                </div>

                {/* Stats Grid */}
                <StatsGrid
                    stats={stats}
                    period={period}
                    childStats={{ active: activeChildCount, inactive: inactiveChildCount }}
                />



                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    <div className="lg:col-span-2">
                        <CategoryIncomeChart data={stats.incomeByCategory} />
                    </div>
                    <div className="lg:col-span-1">
                        <RecentExpenses expenses={expenses} />
                    </div>
                </div>

                <div className="grid grid-cols-1">
                    <MainChart expenses={expenses} period={period} />
                </div>

            </div>
        </AppLayout>
    );
}
