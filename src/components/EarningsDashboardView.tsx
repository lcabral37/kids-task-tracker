import React, { useMemo, useState } from "react";
import { useTaskStore } from "../store/taskStore";
import { Plus, Minus, Trash2 } from "lucide-react";
import BudgetChart from "./BudgetChart";

const EarningsDashboardView: React.FC = () => {
  const { tasks, getAvailableBalance, getSpentToday, setManualAdjustment, manualAdjustment, resetStore } = useTaskStore();
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const stats = useMemo(() => {
    const totalEarned = tasks
      .filter((t) => t.type === "earning")
      .reduce((sum, t) => sum + t.amount * t.completionCount, 0);

    const totalSpent = tasks
      .filter((t) => t.type === "spending")
      .reduce((sum, t) => sum + t.amount * t.completionCount, 0);

    const today = new Date().toISOString().split("T")[0];
    const todayEarned = tasks
      .filter((t) => t.date === today && t.type === "earning")
      .reduce((sum, t) => sum + t.amount * t.completionCount, 0);

    const todaySpent = getSpentToday(today);

    const dailyStats: Record<string, { earned: number; spent: number }> = {};
    tasks.forEach((task) => {
      if (task.completionCount > 0 && task.date !== 'template') {
        if (!dailyStats[task.date]) {
          dailyStats[task.date] = { earned: 0, spent: 0 };
        }
        if (task.type === "earning") {
          dailyStats[task.date].earned += task.amount * task.completionCount;
        } else {
          dailyStats[task.date].spent += task.amount * task.completionCount;
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

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    setManualAdjustment(adjustAmount);
    setAdjustAmount(0);
    setShowAdjustForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded shadow-lg p-8 text-white">
        <p className="text-sm font-medium opacity-90">Current Balance</p>
        <p className="text-6xl font-bold mt-4">💰 {stats.balance}</p>
        <p className="text-sm opacity-75 mt-2">Ready to earn and spend!</p>
        {manualAdjustment !== 0 && (
          <p className="text-xs opacity-75 mt-2">
            (Includes {manualAdjustment > 0 ? '+' : ''}{manualAdjustment} manual adjustment)
          </p>
        )}
      </div>

      {/* Manual Balance Adjustment */}
      {showAdjustForm ? (
        <form onSubmit={handleAdjustBalance} className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Adjust Balance</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Balance Amount
              </label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.valueAsNumber)}
                placeholder="Enter balance amount"
                step="0.5"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Set the manual adjustment amount (can be positive or negative)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition"
              >
                Set Adjustment
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdjustForm(false);
                  setAdjustAmount(0);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAdjustForm(true)}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded font-medium transition flex items-center justify-center gap-2"
        >
          ⚙️ Manually Adjust Balance
        </button>
      )}

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Total Earned */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded shadow p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Earned</h3>
          <p className="text-4xl font-bold mt-2">💰 {stats.totalEarned}</p>
          <p className="text-xs opacity-75 mt-2">All-time earnings</p>
        </div>

        {/* Total Spent */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded shadow p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Spent</h3>
          <p className="text-4xl font-bold mt-2">💸 {stats.totalSpent}</p>
          <p className="text-xs opacity-75 mt-2">All-time spending</p>
        </div>

        {/* Today's Earned */}
        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded shadow p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Today Earned</h3>
          <p className="text-4xl font-bold mt-2">💰 {stats.todayEarned}</p>
          <p className="text-xs opacity-75 mt-2">
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Today's Spent */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded shadow p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Today Spent</h3>
          <p className="text-4xl font-bold mt-2">💸 {stats.todaySpent}</p>
          <p className="text-xs opacity-75 mt-2">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h3>

        {stats.last7Days.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {stats.last7Days.map((date) => {
              const { earned, spent } = stats.dailyStats[date];
              const net = earned - spent;

              return (
                <div
                  key={date}
                  className="flex items-center justify-between p-3 rounded bg-gray-50 border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Earned: 💰 {earned} • Spent: 💸 {spent}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {net >= 0 ? "+" : ""}
                      {net}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Chart */}
      <BudgetChart />

      {/* Reset Data Button */}
      {showResetConfirm ? (
        <div className="bg-red-50 rounded shadow p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-3">Reset All Data?</h3>
          <p className="text-red-700 mb-4">
            This will delete all tasks, activities, and history. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetStore();
                setShowResetConfirm(false);
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition"
            >
              Yes, Delete Everything
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-4 py-3 rounded font-medium transition flex items-center justify-center gap-2 border border-red-200"
        >
          <Trash2 size={18} /> Reset All Data
        </button>
      )}
    </div>
  );
};

export default EarningsDashboardView;
