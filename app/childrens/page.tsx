import AppLayout from "@/components/AppLayout";
import { fetchCategories, fetchChildren } from "@/lib/data";
import ChildSettings from "@/components/ChildSettings";

export default async function ChildrenPage() {
    const categories = await fetchCategories();
    // Fetch all children for management (active & inactive)
    const allChildren = await fetchChildren(true);

    // Filter active for the layout/modal (if passed)
    const activeChildren = allChildren.filter((c: any) => c.status === "ACTIVE");

    return (
        <AppLayout categories={categories} familyChildren={activeChildren}>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Children</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage family members</p>
                </div>

                <ChildSettings children={allChildren as any} categories={categories} />
            </div>
        </AppLayout>
    );
}
