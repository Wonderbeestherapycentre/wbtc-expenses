"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/actions";
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ChangePasswordForm() {
    const [state, dispatch, isPending] = useActionState(updatePassword, undefined);

    return (
        <form action={dispatch} className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    Current Password
                </label>
                <div className="relative">
                    <input
                        name="currentPassword"
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        placeholder="••••••••"
                    />
                    <KeyRound className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    New Password
                </label>
                <div className="relative">
                    <input
                        name="newPassword"
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        placeholder="••••••••"
                    />
                    <KeyRound className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    Confirm New Password
                </label>
                <div className="relative">
                    <input
                        name="confirmPassword"
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        placeholder="••••••••"
                    />
                    <KeyRound className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                    </>
                ) : (
                    "Update Password"
                )}
            </button>

            {state && state !== "Success" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {state}
                </div>
            )}

            {state === "Success" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm border border-green-100 dark:border-green-900/30">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Password updated successfully!
                </div>
            )}
        </form>
    );
}
