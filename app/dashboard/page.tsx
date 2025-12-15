import AppLayout from "@/components/AppLayout";
import StatsGrid from "@/components/dashboard/StatsGrid";
import MainChart from "@/components/dashboard/MainChart";
import RecentExpenses from "@/components/dashboard/RecentExpenses";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import { auth } from "@/auth";
import { fetchExpenses, fetchStats, fetchCategories } from "@/lib/data";
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
        if (to) endDate = endOfDay(new Date(to));
    }

    const { data: expenses } = await fetchExpenses(100, { startDate, endDate });
    const stats = await fetchStats(startDate, endDate);
    const categories = await fetchCategories();

    return (
        <AppLayout categories={categories}>
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
                <StatsGrid stats={stats} period={period} />

                {/* Charts & Lists */}
                <DashboardCharts stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <MainChart expenses={expenses} period={period} />
                    </div>
                    <div className="lg:col-span-1">
                        {/* Use existing Refactored RecentExpenses or inline list styled better */}
                        <div className="glass-card p-6 rounded-2xl h-[400px] flex flex-col animate-fade-in animate-delay-300">
                            <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Recent Transactions</h3>
                            <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {expenses.length === 0 ? (
                                    <p className="text-gray-500 text-center py-10">No expenses yet.</p>
                                ) : (
                                    expenses.slice(0, 10).map(e => (
                                        <div key={e.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                    {e.category[0] || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{e.category}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{e.type.toLowerCase()} • {format(new Date(e.date), "dd MMM yy").toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <span className={`font-bold ${e.type === "INCOME" ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
                                                {e.type === "INCOME" ? "+" : "-"}${Number(e.amount).toFixed(2)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
