import React, { useMemo } from "react";
import { useTaskStore } from "../store/taskStore";

const EarningsDashboard: React.FC = () => {
  const { tasks } = useTaskStore();

  const stats = useMemo(() => {
    const total = tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.amount, 0);

    const dailyStats: Record<string, number> = {};
    tasks.forEach((task) => {
      if (task.completed && task.completedDate) {
        dailyStats[task.completedDate] =
          (dailyStats[task.completedDate] || 0) + task.amount;
      }
    });

    const sortedDates = Object.keys(dailyStats).sort().reverse();
    const last7Days = sortedDates.slice(0, 7);
    const last7DaysTotal = last7Days.reduce(
      (sum, date) => sum + dailyStats[date],
      0,
    );

    return {
      total,
      daily: dailyStats,
      last7Days,
      last7DaysTotal,
      todayEarned: dailyStats[new Date().toISOString().split("T")[0]] || 0,
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
      {/* Total Earnings */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded shadow p-6 text-white">
        <h3 className="text-sm font-medium opacity-90">Total Earnings</h3>
        <p className="text-4xl font-bold mt-2">💰 {stats.total}</p>
        <p className="text-xs opacity-75 mt-2">All-time earnings</p>
      </div>

      {/* Today's Earnings */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded shadow p-6 text-white">
        <h3 className="text-sm font-medium opacity-90">Today's Earnings</h3>
        <p className="text-4xl font-bold mt-2">💰 {stats.todayEarned}</p>
        <p className="text-xs opacity-75 mt-2">
          {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Last 7 Days */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded shadow p-6 text-white">
        <h3 className="text-sm font-medium opacity-90">Last 7 Days</h3>
        <p className="text-4xl font-bold mt-2">💰 {stats.last7DaysTotal}</p>
        <p className="text-xs opacity-75 mt-2">
          {stats.last7Days.length} days with tasks
        </p>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded shadow p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Recent Days
        </h3>
        {stats.last7Days.length === 0 ? (
          <p className="text-gray-500 text-sm">No completed tasks yet</p>
        ) : (
          <div className="space-y-2">
            {stats.last7Days.map((date) => (
              <div
                key={date}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="font-semibold text-green-600">
                  💰 {stats.daily[date]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsDashboard;
