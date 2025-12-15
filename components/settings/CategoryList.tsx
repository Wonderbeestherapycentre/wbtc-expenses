"use client";

import { useState, useTransition } from "react";
import { Edit2, Trash2, Plus, Tag } from "lucide-react";
import { deleteCategory } from "@/lib/actions";
import { toast } from "sonner";
import CategoryModal from "./CategoryModal";
import ConfirmModal from "@/components/ConfirmModal";

interface Category {
    id: string;
    name: string;
    isSystem: boolean;
}

interface CategoryListProps {
    categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    const confirmDelete = () => {
        if (!categoryToDelete) return;

        startTransition(async () => {
            const result = await deleteCategory(categoryToDelete);
            if (result?.message === "Category deleted") {
                toast.success("Category deleted successfully");
            } else {
                toast.error(result?.message || "Failed to delete category");
            }
            setCategoryToDelete(null);
        });
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in animate-delay-100 p-6">
            <ConfirmModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Category?"
                description="Are you sure you want to delete this category? Ensure no expenses are using it first."
                confirmLabel="Delete"
                isPending={isPending}
            />

            <CategoryModal
                isOpen={!!editingCategory || isCreateOpen}
                onClose={() => { setEditingCategory(null); setIsCreateOpen(false); }}
                category={editingCategory}
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h3>
                    <p className="text-sm text-gray-500">Manage expense categories</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 group hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cat.isSystem ? 'bg-gray-200 text-gray-600 dark:bg-neutral-700' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                                {cat.isSystem ? <Tag className="w-4 h-4" /> : cat.name[0]}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                            {cat.isSystem && <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">Default</span>}
                        </div>

                        {!cat.isSystem && (
                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingCategory(cat)}
                                    className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-gray-500 hover:text-blue-600 transition-colors shadow-sm"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setCategoryToDelete(cat.id)}
                                    disabled={isPending}
                                    className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-gray-500 hover:text-red-600 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
