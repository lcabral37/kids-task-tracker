import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { Trash2, RotateCcw } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
const HistoryView = () => {
    const { tasks, toggleTask, removeTask, activeChildId } = useTaskStore();
    const history = useMemo(() => {
        return tasks
            .filter((t) => t.completed)
            .sort((a, b) => {
            const dateA = new Date(a.completedDate || "").getTime();
            const dateB = new Date(b.completedDate || "").getTime();
            return dateB - dateA;
        });
    }, [tasks]);
    const groupedByDate = useMemo(() => {
        const grouped = {};
        history.forEach((task) => {
            const date = task.completedDate || new Date().toISOString().split("T")[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(task);
        });
        return grouped;
    }, [history]);
    const sortedDates = Object.keys(groupedByDate).sort().reverse();
    return (_jsxs("div", { className: "bg-white rounded shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-6", children: "Transaction History" }), history.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No completed transactions yet" })) : (_jsx("div", { className: "space-y-6", children: sortedDates.map((date) => {
                    const dayTransactions = groupedByDate[date];
                    const totalEarned = dayTransactions
                        .filter((t) => t.type === "earning")
                        .reduce((sum, t) => sum + t.amount, 0);
                    const totalSpent = dayTransactions
                        .filter((t) => t.type === "spending")
                        .reduce((sum, t) => sum + t.amount, 0);
                    return (_jsxs("div", { className: "border-b pb-6 last:border-b-0", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "font-semibold text-gray-800", children: new Date(date).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }) }), _jsxs("div", { className: "flex gap-4 text-sm", children: [totalEarned > 0 && (_jsx("div", { className: "bg-green-50 px-2 py-1 rounded", children: _jsxs("span", { className: "text-gray-600", children: ["+\uD83D\uDCB0 ", totalEarned] }) })), totalSpent > 0 && (_jsx("div", { className: "bg-red-50 px-2 py-1 rounded", children: _jsxs("span", { className: "text-gray-600", children: ["-\uD83D\uDCB8 ", totalSpent] }) }))] })] }), _jsx("div", { className: "space-y-2", children: dayTransactions.map((transaction) => (_jsxs("div", { className: `flex items-center justify-between p-3 rounded border ${transaction.type === "earning"
                                        ? "bg-green-50 border-green-200"
                                        : "bg-red-50 border-red-200"}`, children: [_jsxs("div", { className: "flex-grow", children: [_jsx("p", { className: "font-medium text-gray-800", children: transaction.title }), transaction.description && (_jsx("p", { className: "text-xs text-gray-600", children: transaction.description }))] }), _jsxs("div", { className: "flex items-center gap-3 flex-shrink-0", children: [_jsxs("span", { className: `font-bold whitespace-nowrap ${transaction.type === "earning"
                                                        ? "text-green-600"
                                                        : "text-red-600"}`, children: [transaction.type === "earning" ? "+" : "-", transaction.type === "earning" ? "💰" : "💸", " ", transaction.amount] }), _jsx("button", { onClick: () => toggleTask(transaction.id), className: "text-blue-500 hover:text-blue-700 p-1", title: "Undo transaction", children: _jsx(RotateCcw, { size: 18 }) }), _jsx("button", { onClick: () => removeTask(transaction.id), className: "text-red-500 hover:text-red-700 p-1", title: "Delete transaction", children: _jsx(Trash2, { size: 18 }) })] })] }, transaction.id))) })] }, date));
                }) }))] }));
};
export default HistoryView;
