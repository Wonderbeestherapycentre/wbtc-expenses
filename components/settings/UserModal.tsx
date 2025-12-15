"use client";

import { X } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateUser, createUser } from "@/lib/actions";

interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    currentUserRole: "ADMIN" | "USER";
}

export default function UserModal({ isOpen, onClose, user, currentUserRole }: UserModalProps) {
    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = user
                ? await updateUser(user.id, formData)
                : await createUser(formData);

            if (result?.message === "User updated" || result?.message === "User created") {
                onClose();
            } else {
                alert(result.message);
            }
        });
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-neutral-800 animate-slide-up">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user ? "Edit User" : "Add New Member"}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                        <input
                            name="name"
                            defaultValue={user?.name || ""}
                            required
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                        <input
                            name="email"
                            type="email"
                            defaultValue={user?.email || ""}
                            required
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="john@example.com"
                        />
                    </div>

                    {!user && (
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    {currentUserRole === "ADMIN" && (
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
                            <select
                                name="role"
                                defaultValue={user?.role || "USER"}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="USER">Member</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                        >
                            {isPending ? "Saving..." : (user ? "Save Changes" : "Create User")}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
