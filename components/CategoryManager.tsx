"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Loader2, Tag } from "lucide-react";
import { createCategory, deleteCategory } from "@/lib/actions";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

interface Category {
    id: string;
    name: string;
    isSystem?: boolean;
}

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

export default function CategoryManager({ isOpen, onClose, categories }: CategoryManagerProps) {
    const [isPending, startTransition] = useTransition();
    const [newCategoryName, setNewCategoryName] = useState("");
    const [error, setError] = useState("");
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen) return null;

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        startTransition(async () => {
            const formData = new FormData();
            formData.append("name", newCategoryName);
            const result = await createCategory(formData);
            if (result?.message === "Category created") {
                setNewCategoryName("");
                setError("");
                toast.success("Category created successfully");
            } else {
                setError(result?.message || "Failed to create");
                toast.error(result?.message || "Failed to create category");
            }
        });
    };

    const confirmDelete = () => {
        if (!categoryToDelete) return;

        startTransition(async () => {
            const result = await deleteCategory(categoryToDelete);
            if (result?.message === "Category deleted") {
                toast.success("Category deleted");
            } else {
                toast.error(result?.message || "Failed to delete category");
                setError(result?.message || "Failed to delete");
            }
            setCategoryToDelete(null);
        });
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <ConfirmModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Category?"
                description="This will permanently delete the category. Past transactions will keep their data but the category will no longer be selectable."
                confirmLabel="Delete"
                isPending={isPending}
            />

            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-neutral-800 animate-slide-up flex flex-col h-[500px] max-h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Categories</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add or remove custom categories</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">

                    {/* Add New Form */}
                    <form onSubmit={handleAdd} className="flex gap-2 shrink-0">
                        <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Category name..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                disabled={isPending}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPending || !newCategoryName.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center min-w-[3rem]"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-xs">{error}</p>}

                    {/* List */}
                    <div className="overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2">
                        <div className="space-y-2">
                            {categories.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Tag className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-sm">No custom categories yet</p>
                                </div>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors group border border-transparent hover:border-gray-200 dark:hover:border-neutral-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <Tag className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                                        </div>

                                        {!cat.isSystem && (
                                            <button
                                                onClick={() => setCategoryToDelete(cat.id)}
                                                disabled={isPending}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                                                title="Delete Category"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Done Button */}
                <div className="p-6 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
