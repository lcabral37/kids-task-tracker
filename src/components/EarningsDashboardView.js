import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useTaskStore } from "../store/taskStore";
const EarningsDashboardView = () => {
    const { tasks, getAvailableBalance, getSpentToday, setManualAdjustment, manualAdjustment } = useTaskStore();
    const [adjustAmount, setAdjustAmount] = useState(0);
    const [showAdjustForm, setShowAdjustForm] = useState(false);
    const stats = useMemo(() => {
        const totalEarned = tasks
            .filter((t) => t.completed && t.type === "earning")
            .reduce((sum, t) => sum + t.amount, 0);
        const totalSpent = tasks
            .filter((t) => t.completed && t.type === "spending")
            .reduce((sum, t) => sum + t.amount, 0);
        const today = new Date().toISOString().split("T")[0];
        const todayEarned = tasks
            .filter((t) => t.completed && t.completedDate === today && t.type === "earning")
            .reduce((sum, t) => sum + t.amount, 0);
        const todaySpent = getSpentToday(today);
        const dailyStats = {};
        tasks.forEach((task) => {
            if (task.completed && task.completedDate) {
                if (!dailyStats[task.completedDate]) {
                    dailyStats[task.completedDate] = { earned: 0, spent: 0 };
                }
                if (task.type === "earning") {
                    dailyStats[task.completedDate].earned += task.amount;
                }
                else {
                    dailyStats[task.completedDate].spent += task.amount;
                }
            }
        });
        const sortedDates = Object.keys(dailyStats).sort().reverse();
        const last7Days = sortedDates.slice(0, 7);
        return {
            balance: getAvailableBalance(),
            totalEarned,
            totalSpent,
            todayEarned,
            todaySpent,
            dailyStats,
            last7Days,
        };
    }, [tasks, getAvailableBalance, getSpentToday]);
    const handleAdjustBalance = (e) => {
        e.preventDefault();
        setManualAdjustment(adjustAmount);
        setAdjustAmount(0);
        setShowAdjustForm(false);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-green-500 to-green-600 rounded shadow-lg p-8 text-white", children: [_jsx("p", { className: "text-sm font-medium opacity-90", children: "Current Balance" }), _jsxs("p", { className: "text-6xl font-bold mt-4", children: ["\uD83D\uDCB0 ", stats.balance] }), _jsx("p", { className: "text-sm opacity-75 mt-2", children: "Ready to earn and spend!" }), manualAdjustment !== 0 && (_jsxs("p", { className: "text-xs opacity-75 mt-2", children: ["(Includes ", manualAdjustment > 0 ? '+' : '', manualAdjustment, " manual adjustment)"] }))] }), showAdjustForm ? (_jsxs("form", { onSubmit: handleAdjustBalance, className: "bg-white rounded shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Adjust Balance" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "New Balance Amount" }), _jsx("input", { type: "number", value: adjustAmount, onChange: (e) => setAdjustAmount(e.target.valueAsNumber), placeholder: "Enter balance amount", step: "0.5", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500" }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Set the manual adjustment amount (can be positive or negative)" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", className: "flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition", children: "Set Adjustment" }), _jsx("button", { type: "button", onClick: () => {
                                            setShowAdjustForm(false);
                                            setAdjustAmount(0);
                                        }, className: "flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium transition", children: "Cancel" })] })] })] })) : (_jsx("button", { onClick: () => setShowAdjustForm(true), className: "w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded font-medium transition flex items-center justify-center gap-2", children: "\u2699\uFE0F Manually Adjust Balance" })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-blue-500 to-blue-600 rounded shadow p-6 text-white", children: [_jsx("h3", { className: "text-sm font-medium opacity-90", children: "Total Earned" }), _jsxs("p", { className: "text-4xl font-bold mt-2", children: ["\uD83D\uDCB0 ", stats.totalEarned] }), _jsx("p", { className: "text-xs opacity-75 mt-2", children: "All-time earnings" })] }), _jsxs("div", { className: "bg-gradient-to-br from-red-500 to-red-600 rounded shadow p-6 text-white", children: [_jsx("h3", { className: "text-sm font-medium opacity-90", children: "Total Spent" }), _jsxs("p", { className: "text-4xl font-bold mt-2", children: ["\uD83D\uDCB8 ", stats.totalSpent] }), _jsx("p", { className: "text-xs opacity-75 mt-2", children: "All-time spending" })] }), _jsxs("div", { className: "bg-gradient-to-br from-green-400 to-green-500 rounded shadow p-6 text-white", children: [_jsx("h3", { className: "text-sm font-medium opacity-90", children: "Today Earned" }), _jsxs("p", { className: "text-4xl font-bold mt-2", children: ["\uD83D\uDCB0 ", stats.todayEarned] }), _jsx("p", { className: "text-xs opacity-75 mt-2", children: new Date().toLocaleDateString() })] }), _jsxs("div", { className: "bg-gradient-to-br from-orange-400 to-orange-500 rounded shadow p-6 text-white", children: [_jsx("h3", { className: "text-sm font-medium opacity-90", children: "Today Spent" }), _jsxs("p", { className: "text-4xl font-bold mt-2", children: ["\uD83D\uDCB8 ", stats.todaySpent] }), _jsx("p", { className: "text-xs opacity-75 mt-2", children: new Date().toLocaleDateString() })] })] }), _jsxs("div", { className: "bg-white rounded shadow p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "Recent Activity" }), stats.last7Days.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No transactions yet" })) : (_jsx("div", { className: "space-y-3", children: stats.last7Days.map((date) => {
                            const { earned, spent } = stats.dailyStats[date];
                            const net = earned - spent;
                            return (_jsxs("div", { className: "flex items-center justify-between p-3 rounded bg-gray-50 border border-gray-200", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-800", children: new Date(date).toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                }) }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Earned: \uD83D\uDCB0 ", earned, " \u2022 Spent: \uD83D\uDCB8 ", spent] })] }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: `text-xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`, children: [net >= 0 ? "+" : "", net] }) })] }, date));
                        }) }))] })] }));
};
export default EarningsDashboardView;
