import { notFound } from "next/navigation";
import { fetchChild, fetchExpenses, fetchStats, fetchCategories, fetchChildren } from "@/lib/data";
import ExpenseList from "@/components/ExpenseList";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import Link from "next/link";

interface ChildPageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams?: Promise<{
        page?: string;
    }>;
}

export default async function ChildPage({ params, searchParams }: ChildPageProps) {
    const { id } = await params;
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams?.page) || 1;

    const child = await fetchChild(id);

    if (!child) {
        notFound();
    }

    // Fetch stats specific to this child
    const stats = await fetchStats(undefined, undefined, id);

    // Fetch expenses specific to this child
    const { data: expenses } = await fetchExpenses(undefined, { childId: id }, page);

    // Fetch other data needed for ExpenseList
    const categories = await fetchCategories();
    const children = await fetchChildren();

    return (
        <div className="space-y-6 px-2 md:px-4 ">
            <div className="flex items-center gap-4">
                <Link href="/childrens">
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {child.name}
                    </h1>
                    <p className="text-muted-foreground text-sm text-gray-500">
                        View financial details for {child.name}
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="glass-card rounded-xl p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Paid Amount</h3>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{stats.totalIncome.toFixed(2)}
                        </div>
                    </div>
                </div>
                <div className="glass-card rounded-xl p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Due Amount</h3>
                        <PiggyBank className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-orange-600">
                            ₹{stats.totalDue.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div>
                <ExpenseList
                    expenses={expenses}
                    categories={categories}
                    familyChildren={children}
                    defaultChildId={id}
                />
            </div>
        </div>
    );
}


