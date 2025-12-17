import AppLayout from "@/components/AppLayout";
import DueListTable from "@/components/dues/DueListTable"; // Updated import
import { fetchExpenses, fetchCategories, fetchChildren } from "@/lib/data";
import { auth } from "@/auth";

export default async function DuesPage() {
    const session = await auth();

    // Fetch specifically "DUE" type transactions
    const { data: dueExpenses } = await fetchExpenses(undefined, { type: "DUE" });
    const categories = await fetchCategories();
    const children = await fetchChildren(true);

    return (
        <AppLayout categories={categories} familyChildren={children}>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Due Payments</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage pending payments and fees
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1">
                    <DueListTable expenses={dueExpenses} />
                </div>
            </div>
        </AppLayout>
    );
}
