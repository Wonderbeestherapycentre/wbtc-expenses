import AppLayout from "@/components/AppLayout";
import { fetchExpenses, fetchCategories, fetchChildren } from "@/lib/data";
import ExpenseList from "@/components/ExpenseList";
import ExpenseFilters from "@/components/ExpenseFilters";
import Pagination from "@/components/Pagination";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export default async function ExpensesPage({ searchParams }: { searchParams: any }) {
    const params = await searchParams;

    const categoryId = typeof params?.category === 'string' ? params.category : undefined;
    const period = typeof params?.period === 'string' ? params.period : undefined;
    const page = typeof params?.page === 'string' ? Number(params.page) : 1;
    const from = typeof params?.from === 'string' ? params.from : undefined;
    const to = typeof params?.to === 'string' ? params.to : undefined;

    console.log("Filters Applied:", { categoryId, period, page, from, to });

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    const now = new Date();

    if (period === "day") {
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    } else if (period === "week") {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else if (period === "month") {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    } else if (period === "year") {
        startDate = startOfYear(now);
        endDate = endOfYear(now);
    } else if (period === "custom") {
        if (from) startDate = startOfDay(new Date(from));
        if (to) endDate = endOfDay(new Date(to));
    }


    const { data: expenses, meta } = await fetchExpenses(ITEMS_PER_PAGE, { categoryId, startDate, endDate }, page);
    const categories = await fetchCategories();
    const children = await fetchChildren();

    return (
        <AppLayout categories={categories} familyChildren={children}>

            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Expenses</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your spending history</p>
                </div>

                <ExpenseFilters categories={categories} />

                <ExpenseList expenses={expenses} categories={categories} familyChildren={children} />

                <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
            </div>
        </AppLayout>
    );
}
