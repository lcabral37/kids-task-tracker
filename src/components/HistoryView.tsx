import React, { useMemo } from "react";
import { useTaskStore } from "../store/taskStore";

const HistoryView: React.FC = () => {
  const { tasks } = useTaskStore();

  const history = useMemo(() => {
    const dailyStats: Record<string, { earned: number; spent: number; details: any[] }> = {};
    
    tasks.forEach((task) => {
      if (task.completionCount > 0 && task.date !== 'template') {
        if (!dailyStats[task.date]) {
          dailyStats[task.date] = { earned: 0, spent: 0, details: [] };
        }
        const amount = task.amount * task.completionCount;
        if (task.type === "earning") {
          dailyStats[task.date].earned += amount;
        } else {
          dailyStats[task.date].spent += amount;
        }
        dailyStats[task.date].details.push({
          title: task.title,
          type: task.type,
          amount: amount,
          count: task.completionCount,
        });
      }
    });

    const sortedDates = Object.keys(dailyStats).sort().reverse();
    return { dailyStats, sortedDates };
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Transaction History</h2>

        {history.sortedDates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {history.sortedDates.map((date) => {
              const { earned, spent, details } = history.dailyStats[date];
              const net = earned - spent;

              return (
                <div key={date} className="rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {net >= 0 ? "+" : ""}{net}
                      </p>
                      <p className="text-xs text-gray-500">
                        💰 {earned} • 💸 {spent}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm space-y-1 bg-gray-50 rounded p-2">
                    {details.map((detail, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className={detail.type === "earning" ? "text-green-600" : "text-red-600"}>
                          {detail.title} (×{detail.count})
                        </span>
                        <span className="font-medium">{detail.type === "earning" ? "+" : "-"}{detail.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
