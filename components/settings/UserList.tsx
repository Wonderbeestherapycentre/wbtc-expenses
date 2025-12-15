"use client";

import { useState, useTransition } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import { deleteUser } from "@/lib/actions";
import UserModal from "./UserModal";

interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    color?: string | null;
}

interface UserListProps {
    users: User[];
    currentUserRole: "ADMIN" | "USER";
    currentUserId: string;
}

export default function UserList({ users, currentUserRole, currentUserId }: UserListProps) {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        startTransition(async () => {
            await deleteUser(id);
        });
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in animate-delay-100">
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={editingUser}
                currentUserRole={currentUserRole}
            />

            <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                {currentUserRole === "ADMIN" && (
                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                        <tr>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                                            style={{ backgroundColor: user.color || '#3b82f6' }}
                                        >
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    {(currentUserRole === "ADMIN" || currentUserId === user.id) && (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingUser(user);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {currentUserRole === "ADMIN" && currentUserId !== user.id && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={isPending}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
