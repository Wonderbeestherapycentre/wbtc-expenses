
import { notFound } from "next/navigation";
import { fetchStaff, fetchExpenses, fetchStats, fetchCategories, fetchChildren, fetchStaffs } from "@/lib/data";
import ExpenseList from "@/components/ExpenseList";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import Link from "next/link";

interface StaffPageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams?: Promise<{
        page?: string;
    }>;
}

export default async function StaffPage({ params, searchParams }: StaffPageProps) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams?.page) || 1;

    const staff = await fetchStaff(id);

    if (!staff) {
        notFound();
    }

    // Fetch stats specific to this staff
    const stats = await fetchStats(undefined, undefined, undefined, id);

    // Fetch expenses specific to this staff
    const { data: expenses } = await fetchExpenses(undefined, { staffId: id }, page);

    // Fetch other data needed for ExpenseList
    const categories = await fetchCategories();
    const children = await fetchChildren();
    const staffs = await fetchStaffs();

    return (
        <div className="space-y-6 px-2 md:px-4 ">
            <div className="flex items-center gap-4">
                <Link href="/staffs">
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {staff.name}
                    </h1>
                    <p className="text-muted-foreground text-sm text-gray-500">
                        View details and transactions for {staff.name}
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="glass-card rounded-xl p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Paid (Expense)</h3>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-red-600">
                            ₹{stats.totalExpenses.toFixed(2)}
                        </div>
                    </div>
                </div>
                {/* Staff might not have Due/Income usually, but let's show Balance or maybe nothing else? 
                    If we use "Fee" button for staff as "Payment" (Expense), then 'totalExpenses' tracks payments to staff.
                    If we strictly mirror child, child has Income (Paid) and Due. 
                    Staff probably has Salary (Expense) and maybe Advance (Due?).
                    Let's just show Expenses for now as that's safe.
                    Or show Income if they generate revenue?
                    User said "Staffs like child".
                    Child tracks "Paid Amount" (Income) and "Due Amount" (Due).
                    If Staff is logically same, maybe we track "Income" from Staff? No, usually we pay staff.
                    But if "Staff" means "Person who brings in commission", maybe Income?
                    But usually Staff = Expense.
                    Let's assume standard expense tracking for staff. 
                    So Total Paid = stats.totalExpenses.
                */}
            </div>

            {/* Transactions List */}
            <div>
                <ExpenseList
                    expenses={expenses}
                    categories={categories}
                    familyChildren={children}
                    familyStaffs={staffs}
                    defaultStaffId={id}
                />
            </div>
        </div>
    );
}
