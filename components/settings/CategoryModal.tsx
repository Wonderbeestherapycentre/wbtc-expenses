"use client";

import { X } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { createCategory, updateCategory } from "@/lib/actions";

interface Category {
    id: string;
    name: string;
    isSystem: boolean;
}

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null; // If null, create mode
}

export default function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
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
            let result;
            if (category) {
                result = await updateCategory(category.id, formData);
            } else {
                result = await createCategory(formData);
            }

            // Simple check for success message or lack of error
            // The actions return { message: string }
            if (result?.message.includes("created") || result?.message.includes("updated")) {
                onClose();
            } else {
                alert(result.message);
            }
        });
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-neutral-800 animate-slide-up">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {category ? "Edit Category" : "New Category"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Category Name</label>
                        <input
                            name="name"
                            defaultValue={category?.name}
                            placeholder="e.g. Vacation"
                            required
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

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
                            {isPending ? "Saving..." : (category ? "Save Changes" : "Create Category")}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
