import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTaskStore } from "../store/taskStore";

interface ChartDataPoint {
  date: string;
  earned: number;
  spent: number;
  balance: number;
}

const BudgetChart: React.FC = () => {
  const { tasks } = useTaskStore();
  const [days, setDays] = useState(7);

  const chartData = useMemo(() => {
    const today = new Date();
    const data: ChartDataPoint[] = [];
    let runningBalance = 0;

    // Generate chart data for last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayTasks = tasks.filter((t) => t.date === dateStr && t.date !== 'template');
      const earned = dayTasks
        .filter((t) => t.type === "earning")
        .reduce((sum, t) => sum + t.amount * t.completionCount, 0);
      const spent = dayTasks
        .filter((t) => t.type === "spending")
        .reduce((sum, t) => sum + t.amount * t.completionCount, 0);

      runningBalance += earned - spent;

      data.push({
        date: new Date(dateStr).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        earned,
        spent,
        balance: runningBalance,
      });
    }

    return data;
  }, [tasks, days]);

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Budget Trends</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setDays(7)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              days === 7
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => setDays(14)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              days === 14
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            14 days
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              days === 30
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            30 days
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No data available yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value) => `${value}`}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="earned"
              stroke="#10b981"
              strokeWidth={2}
              name="Earned"
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="spent"
              stroke="#ef4444"
              strokeWidth={2}
              name="Spent"
              dot={{ fill: "#ef4444", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Running Balance"
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BudgetChart;
