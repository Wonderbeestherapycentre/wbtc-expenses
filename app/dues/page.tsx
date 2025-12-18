import AppLayout from "@/components/AppLayout";
import DueListTable from "@/components/dues/DueListTable";
import { fetchExpenses, fetchCategories, fetchChildren } from "@/lib/data";
import { auth } from "@/auth";
import ExpenseFilters from "@/components/ExpenseFilters";
import Pagination from "@/components/Pagination";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from "date-fns";

export default async function DuesPage({ searchParams }: { searchParams: any }) {
    const session = await auth();
    const params = await searchParams;

    const categoryId = typeof params?.category === 'string' ? params.category : undefined;
    const period = typeof params?.period === 'string' ? params.period : undefined;
    const page = typeof params?.page === 'string' ? Number(params.page) : 1;
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

    // Fetch specifically "DUE" type transactions with filters and pagination
    const { data: dueExpenses, meta } = await fetchExpenses(ITEMS_PER_PAGE, {
        categoryId,
        startDate,
        endDate,
        type: "DUE"
    }, page);

    const categories = await fetchCategories();
    const children = await fetchChildren(true);

    return (
        <AppLayout categories={categories} familyChildren={children}>
            <div className="space-y-2 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Due Payments</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage pending payments and fees
                        </p>
                    </div>
                </div>

                <ExpenseFilters categories={categories} showTypeFilter={false} />

                <div className="grid grid-cols-1">
                    <DueListTable expenses={dueExpenses} />
                </div>

                <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
            </div>
        </AppLayout>
    );
}
