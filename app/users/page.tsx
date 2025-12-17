import AppLayout from "@/components/AppLayout";
import { auth } from "@/auth";
import { fetchUsers, fetchCategories } from "@/lib/data";
import UserList from "@/components/settings/UserList";

export default async function UsersPage() {
    const session = await auth();
    const users = await fetchUsers();
    const categories = await fetchCategories();

    // Cast user role from DB which is string to literal
    const currentUserRole = (session?.user?.role as "ADMIN" | "USER") || "USER";

    return (
        <AppLayout categories={categories}>
            <div className="space-y-6 animate-fade-in pb-10">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your family users</p>
                </div>

                <UserList
                    users={users as any} // Type casting for now, schema vs view logic
                    currentUserRole={currentUserRole}
                    currentUserId={session?.user?.id || ""}
                />
            </div>
        </AppLayout>
    );
}
