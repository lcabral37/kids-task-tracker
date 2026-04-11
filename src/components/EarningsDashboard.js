import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useTaskStore } from "../store/taskStore";
const EarningsDashboard = () => {
    const { tasks } = useTaskStore();
    const stats = useMemo(() => {
        const total = tasks
            .filter((t) => t.completed)
            .reduce((sum, t) => sum + t.amount, 0);
        const dailyStats = {};
        tasks.forEach((task) => {
            if (task.completed && task.completedDate) {
                dailyStats[task.completedDate] =
                    (dailyStats[task.completedDate] || 0) + task.amount;
            }
        });
        const sortedDates = Object.keys(dailyStats).sort().reverse();
        const last7Days = sortedDates.slice(0, 7);
        const last7DaysTotal = last7Days.reduce((sum, date) => sum + dailyStats[date], 0);
        return {
            total,
            daily: dailyStats,
            last7Days,
            last7DaysTotal,
            todayEarned: dailyStats[new Date().toISOString().split("T")[0]] || 0,
        };
    }, [tasks]);
    return (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-purple-500 to-purple-600 rounded shadow p-6 text-white", children: [_jsx("h3", { className: "text-sm font-medium opacity-90", children: "Total Earnings" }), _jsxs("p", { className: "text-4xl font-bold mt-2", children: ["\uD83D\uDCB0 ", stats.total] }), _jsx("p", { className: "text-xs opacity-75 mt-2", children: "All-time earnings" })] }), _jsxs("div", { className: "bg-gradient-to-br from-green-500 to-green-600 rounded shadow p-6 text-white", children: [_jsx("h3", { className: "text-sm font-medium opacity-90", children: "Today's Earnings" }), _jsxs("p", { className: "text-4xl font-bold mt-2", children: ["\uD83D\uDCB0 ", stats.todayEarned] }), _jsx("p", { className: "text-xs opacity-75 mt-2", children: new Date().toLocaleDateString() })] }), _jsxs("div", { className: "bg-gradient-to-br from-blue-500 to-blue-600 rounded shadow p-6 text-white", children: [_jsx("h3", { className: "text-sm font-medium opacity-90", children: "Last 7 Days" }), _jsxs("p", { className: "text-4xl font-bold mt-2", children: ["\uD83D\uDCB0 ", stats.last7DaysTotal] }), _jsxs("p", { className: "text-xs opacity-75 mt-2", children: [stats.last7Days.length, " days with tasks"] })] }), _jsxs("div", { className: "bg-white rounded shadow p-6", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Recent Days" }), stats.last7Days.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No completed tasks yet" })) : (_jsx("div", { className: "space-y-2", children: stats.last7Days.map((date) => (_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-600", children: new Date(date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    }) }), _jsxs("span", { className: "font-semibold text-green-600", children: ["\uD83D\uDCB0 ", stats.daily[date]] })] }, date))) }))] })] }));
};
export default EarningsDashboard;
