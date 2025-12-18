"use client";

import { useState, useTransition, useEffect } from "react";
import { createStaff, updateStaff } from "@/lib/actions";
import { toast } from "sonner";
import { X, Save, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";

interface StaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff?: {
        id: string;
        name: string;
        status: "ACTIVE" | "INACTIVE";
    } | null;
}

export default function StaffModal({ isOpen, onClose, staff }: StaffModalProps) {
    const [mounted, setMounted] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form State
    const [name, setName] = useState("");
    const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

    // Initialize/Reset form
    useEffect(() => {
        if (isOpen) {
            if (staff) {
                setName(staff.name);
                setStatus(staff.status);
            } else {
                setName("");
                setStatus("ACTIVE");
            }
        }
    }, [isOpen, staff]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("status", status);

        startTransition(async () => {
            let result;
            if (staff) {
                // Update
                result = await updateStaff(staff.id, formData);
            } else {
                // Create
                result = await createStaff(formData);
            }

            if (result.message.includes("created") || result.message.includes("updated")) {
                toast.success(result.message);
                onClose();
            } else {
                toast.error(result.message);
            }
        });
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-neutral-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {staff ? "Edit Staff" : "Add Staff"}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {staff ? "Update existing staff details" : "Add a new staff member to your family"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="space-y-4">

                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>

                        {/* Status Select */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                <AlertCircle className="w-3 h-3 inline mr-1" />
                                Inactive staff won't appear in the "Add Expense" dropdown.
                            </p>
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Staff
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
