"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteStaff } from "@/lib/actions";
import { Plus, Pencil, Trash2, Banknote, Eye } from "lucide-react";
import Link from "next/link";
import StaffModal from "./StaffModal";
import ConfirmModal from "./ConfirmModal";
import ExpenseModal from "./ExpenseModal";


interface Staff {
    id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE";
}

export default function StaffSettings({ staffs, categories = [] }: { staffs: Staff[], categories?: { id: string; name: string }[] }) {
    const [isPending, startTransition] = useTransition();

    // Modal states
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [feeStaffId, setFeeStaffId] = useState("");
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        setDeletingStaff(id);
    };

    const handleConfirmDelete = () => {
        if (!deletingStaff) return;

        startTransition(async () => {
            const result = await deleteStaff(deletingStaff);
            if (result.message.includes("deleted")) {
                toast.success(result.message);
                setDeletingStaff(null);
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleEditClick = (staff: Staff) => {
        setEditingStaff(staff);
        setIsStaffModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingStaff(null);
        setIsStaffModalOpen(true);
    };

    const handleFeeClick = (staffId: string) => {
        setFeeStaffId(staffId);
        setIsFeeModalOpen(true);
    };

    const generateAvatarColor = (name: string) => {
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <>
            <StaffModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
                staff={editingStaff}
            />

            <ConfirmModal
                isOpen={!!deletingStaff}
                onClose={() => setDeletingStaff(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Staff"
                description="Are you sure you want to delete this staff member? This action might affect existing expenses linked to them."
                confirmLabel="Delete"
                isPending={isPending}
            />

            <ExpenseModal
                isOpen={isFeeModalOpen}
                onClose={() => setIsFeeModalOpen(false)}
                categories={categories}
                familyStaffs={staffs}
                defaultType="EXPENSE" // Staff usually = Salary (Expense) or specific expense? Or Fee?
                // User said "like Child". Child had "Fee" which was "INCOME".
                // If this is for Staff Salary, it should be "EXPENSE".
                // Let's assume EXPENSE for Staff payments.
                // But wait, user said "same". Child's button says "Fee".
                // I'll keep it consistent with Child for now, but name it "Payment"?
                // ChildSettings has <Banknote> Fee.
                // I will use "Payment" for staff and default to EXPENSE?
                // Or maybe Staff also generates Income?
                // Let's stick safe: "Transaction" button?
                // Or "Fee" if it's mirroring Child exactly?
                // User said "staffs like child, remaining same".
                // I will default to EXPENSE for Staff as that makes more sense (Salary).
                defaultStaffId={feeStaffId}
            />

            <div className="glass-card rounded-2xl overflow-hidden animate-fade-in p-4 md:p-6">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Staff Members</h3>
                    <button
                        onClick={handleAddClick}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Staff</span>
                    </button>
                </div>

                <div className="overflow-x-auto -mx-4 px-4 md:-mx-6 md:px-6 pb-4">
                    <table className="w-full md:min-w-[600px]">
                        <thead className="bg-gray-50/50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                            <tr>
                                <th className="text-left py-1 px-1 md:py-2 md:px-6 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="hidden md:table-cell text-left py-1 px-3 md:py-2 md:px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-center py-1 px-1 md:py-2 md:px-6 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                                <th className="text-right py-1 px-1 md:py-2 md:px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                            {staffs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500">No staff members added yet.</td>
                                </tr>
                            ) : (
                                staffs.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="py-1 px-1 md:py-2 md:px-6">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-sm"
                                                    style={{ backgroundColor: generateAvatarColor(staff.name) }}
                                                >
                                                    {staff.name[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {staff.name}
                                                    </span>
                                                    <span className={`md:hidden mt-0.5 inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-medium ${staff.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                        {staff.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell py-1 px-3 md:py-2 md:px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${staff.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {staff.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-1 px-1 md:py-2 md:px-6 text-center">
                                            <button onClick={() => handleFeeClick(staff.id)}
                                                className="inline-flex items-center px-3 py-2  hover:bg-blue-700 hover:text-white text-black text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"

                                            >
                                                <span className="flex items-center gap-1">
                                                    <Banknote className="w-4 h-4" /> Salary
                                                </span>
                                            </button>
                                        </td>
                                        <td className="py-1 px-1 md:py-2 md:px-6 text-right">
                                            <div className="flex items-center justify-end gap-1 md:gap-2">
                                                <Link
                                                    href={`/staffs/${staff.id}`}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleEditClick(staff)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(staff.id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
