import AppLayout from "@/components/AppLayout";
import { fetchCategories, fetchChildren, fetchChildrenPaginated } from "@/lib/data";
import ChildSettings from "@/components/ChildSettings";
import Pagination from "@/components/Pagination";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export default async function ChildrenPage({ searchParams }: { searchParams: any }) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;

    const categories = await fetchCategories();

    // Fetch active children for the layout (dropdowns)
    const activeChildren = await fetchChildren();

    // Fetch paginated children (active & inactive) for current page
    const { data: childrenList, meta } = await fetchChildrenPaginated(page, ITEMS_PER_PAGE, true);

    return (
        <AppLayout categories={categories} familyChildren={activeChildren}>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Children</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage family members</p>
                </div>

                <ChildSettings children={childrenList as any} categories={categories} />

                <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
            </div>
        </AppLayout>
    );
}
