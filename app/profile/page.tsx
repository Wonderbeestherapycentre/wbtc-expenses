import AppLayout from "@/components/AppLayout";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { auth } from "@/auth";
import { fetchCategories } from "@/lib/data";
import { User, Mail, Shield, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, families } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) redirect("/");

    const categories = await fetchCategories();

    // Fetch full user details (e.g. family name)
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        with: {
            family: true
        }
    });

    if (!user) redirect("/");

    return (
        <AppLayout categories={categories}>
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">

                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and security</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* User Details Card */}
                    <div className="glass-card p-6 rounded-2xl h-fit">
                        <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-500" />
                            Personal Information
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                                    <Users className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Family Group</p>
                                    <p className="text-gray-900 dark:text-white font-medium">{user.family?.name || "No Family"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="glass-card p-6 rounded-2xl h-fit">
                        <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-green-500" />
                            Security
                        </h3>
                        <ChangePasswordForm />
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
