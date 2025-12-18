
import AppLayout from "@/components/AppLayout";
import { fetchCategories, fetchStaffs } from "@/lib/data";
import StaffSettings from "@/components/StaffSettings";

export default async function StaffsPage() {
    const categories = await fetchCategories();
    // Fetch all staffs for management (active & inactive)
    const allStaffs = await fetchStaffs(true);

    // Filter active for the layout/modal (if passed)
    const activeStaffs = allStaffs.filter((s: any) => s.status === "ACTIVE");

    return (
        <AppLayout categories={categories} familyStaffs={activeStaffs}>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Members</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage staff and payments</p>
                </div>

                <StaffSettings staffs={allStaffs as any} categories={categories} />
            </div>
        </AppLayout>
    );
}
