import AppLayout from "@/components/AppLayout";
import { fetchExpenses, fetchCategories, fetchChildren, fetchStaffs } from "@/lib/data";
import ExpenseList from "@/components/ExpenseList";
import ExpenseFilters from "@/components/ExpenseFilters";
import Pagination from "@/components/Pagination";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from "date-fns";

export default async function ExpensesPage({ searchParams }: { searchParams: any }) {
    const params = await searchParams;

    const categoryId = typeof params?.category === 'string' ? params.category : undefined;
    const period = typeof params?.period === 'string' ? params.period : undefined;
    const page = typeof params?.page === 'string' ? Number(params.page) : 1;
    const from = typeof params?.from === 'string' ? params.from : undefined;
    const to = typeof params?.to === 'string' ? params.to : undefined;
    const type = typeof params?.type === 'string' && ["INCOME", "EXPENSE", "DUE"].includes(params.type) ? params.type as "INCOME" | "EXPENSE" | "DUE" : undefined;

    console.log("Filters Applied:", { categoryId, period, page, from, to, type });

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
    } else if (period === "year") {
        startDate = startOfYear(now);
        endDate = endOfYear(now);
    } else if (period === "last_year") {
        const lastYear = subYears(now, 1);
        startDate = startOfYear(lastYear);
        endDate = endOfYear(lastYear);
    } else if (period === "custom") {
        if (from) startDate = startOfDay(new Date(from));
        if (to) endDate = endOfDay(new Date(to));
    }


    const { data: expenses, meta } = await fetchExpenses(ITEMS_PER_PAGE, { categoryId, startDate, endDate, type }, page);
    const categories = await fetchCategories();
    const children = await fetchChildren();
    const staffs = await fetchStaffs();

    return (
        <AppLayout categories={categories} familyChildren={children} familyStaffs={staffs}>

            <div className="space-y-2 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Expenses</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your spending history</p>
                </div>

                <ExpenseFilters categories={categories} />

                <ExpenseList expenses={expenses} categories={categories} familyChildren={children} familyStaffs={staffs} />

                <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
            </div>
        </AppLayout>
    );
}
