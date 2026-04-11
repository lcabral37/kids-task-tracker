import React from "react";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { useTaskStore } from "../store/taskStore";

const TaskList: React.FC = () => {
  const { activeChildId, tasks, completeTask, removeTask, getTasksByChild } =
    useTaskStore();

  if (!activeChildId) {
    return (
      <div className="bg-white rounded shadow p-6">
        <p className="text-gray-500 text-center py-8">
          Select a child to see their tasks
        </p>
      </div>
    );
  }

  const childTasks = getTasksByChild(activeChildId);
  const completedCount = childTasks.filter((t) => t.completed).length;
  const totalEarned = childTasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Tasks</h2>
        <div className="flex gap-4 text-sm">
          <div className="bg-blue-50 px-3 py-2 rounded">
            <span className="text-gray-600">Completed: </span>
            <span className="font-bold text-blue-600">
              {completedCount}/{childTasks.length}
            </span>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded">
            <span className="text-gray-600">Earned: </span>
            <span className="font-bold text-green-600">💰 {totalEarned}</span>
          </div>
        </div>
      </div>

      {childTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No tasks yet. Create one to get started!
        </p>
      ) : (
        <div className="space-y-2">
          {childTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded border transition ${
                task.completed
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
              }`}
            >
              <button
                onClick={() => completeTask(task.id)}
                className="flex-shrink-0 text-gray-400 hover:text-green-500 transition"
                title={task.completed ? "Task completed" : "Mark as complete"}
              >
                {task.completed ? (
                  <CheckCircle2 size={24} className="text-green-500" />
                ) : (
                  <Circle size={24} />
                )}
              </button>

              <div className="flex-grow min-w-0">
                <h3
                  className={`font-medium ${
                    task.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-500">{task.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-semibold text-green-600 whitespace-nowrap">
                  💰 {task.amount}
                </span>
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete task"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
