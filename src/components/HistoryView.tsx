import React, { useMemo } from "react";
import { Trash2, RotateCcw } from "lucide-react";
import { useTaskStore } from "../store/taskStore";

const HistoryView: React.FC = () => {
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
    const grouped: Record<string, typeof history> = {};
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

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-semibold mb-6">Transaction History</h2>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No completed transactions yet
        </p>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const dayTransactions = groupedByDate[date];
            const totalEarned = dayTransactions
              .filter((t) => t.type === "earning")
              .reduce((sum, t) => sum + t.amount, 0);
            const totalSpent = dayTransactions
              .filter((t) => t.type === "spending")
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div key={date} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="flex gap-4 text-sm">
                    {totalEarned > 0 && (
                      <div className="bg-green-50 px-2 py-1 rounded">
                        <span className="text-gray-600">+💰 {totalEarned}</span>
                      </div>
                    )}
                    {totalSpent > 0 && (
                      <div className="bg-red-50 px-2 py-1 rounded">
                        <span className="text-gray-600">-💸 {totalSpent}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-3 rounded border ${
                        transaction.type === "earning"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex-grow">
                        <p className="font-medium text-gray-800">
                          {transaction.title}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-gray-600">
                            {transaction.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`font-bold whitespace-nowrap ${
                            transaction.type === "earning"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "earning" ? "+" : "-"}
                          {transaction.type === "earning" ? "💰" : "💸"}{" "}
                          {transaction.amount}
                        </span>

                        <button
                          onClick={() => toggleTask(transaction.id)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Undo transaction"
                        >
                          <RotateCcw size={18} />
                        </button>

                        <button
                          onClick={() => removeTask(transaction.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
