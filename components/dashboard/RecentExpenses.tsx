import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Expense } from "@/lib/types";

interface RecentExpensesProps {
    expenses: Expense[];
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
    // Take last 5, but expenses passed in are likely already sorted/filtered by parent if needed.
    // However, the dashboard passes *all* fetched expenses for the period.
    // We want the most recent ones.
    const recent = expenses.slice(0, 10); // Dashboard passes already sorted list usually

    return (
        <div className="glass-card p-6 rounded-2xl h-[400px] flex flex-col animate-fade-in animate-delay-300">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Recent Transactions</h3>
            <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {recent.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">No expenses yet.</p>
                ) : (
                    recent.map(e => (
                        <div key={e.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                    {e.category[0] || "?"}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{e.category}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-500 capitalize">{e.type.toLowerCase()} • {format(new Date(e.date), "dd MMM yy").toUpperCase()}</p>
                                        {/* {e.user && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-400">
                                                {e.user.name}
                                            </span>
                                        )} */}
                                    </div>
                                </div>
                            </div>
                            <span className={`font-bold ${e.type === "INCOME" ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
                                {e.type === "INCOME" ? "+" : "-"}{formatCurrency(e.amount)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
