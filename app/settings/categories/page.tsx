import AppLayout from "@/components/AppLayout";
import { fetchCategories } from "@/lib/data";
import CategoryList from "@/components/settings/CategoryList";

export default async function CategoriesPage() {
    const categories = await fetchCategories();

    return (
        <AppLayout categories={categories}>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage transaction categories</p>
                </div>

                <CategoryList categories={categories} />
            </div>
        </AppLayout>
    );
}
