import React, { useState } from "react";
import { Plus, CheckCircle2, Circle, Trash2, Edit2, Save, X, Repeat2 } from "lucide-react";
import { useTaskStore } from "../store/taskStore";

const TasksView: React.FC = () => {
  const {
    activeChildId,
    addTask,
    toggleTask,
    removeTask,
    updateTask,
    getTasksByChildAndType,
  } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(1);
  const [recurring, setRecurring] = useState<'none' | 'daily'>('none');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState(1);
  const [editRecurring, setEditRecurring] = useState<'none' | 'daily'>('none');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeChildId) {
      alert("Please select a child first");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    addTask({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      amount: Math.max(0, amount),
      completed: false,
      childId: activeChildId,
      date: new Date().toISOString().split("T")[0],
      type: "earning",
      recurring: recurring,
    });

    setTitle("");
    setDescription("");
    setAmount(1);
    setRecurring('none');
  };

  const startEdit = (taskId: string, currentTitle: string, currentDescription: string | undefined, currentAmount: number, currentRecurring?: 'none' | 'daily') => {
    setEditingId(taskId);
    setEditTitle(currentTitle);
    setEditDescription(currentDescription || "");
    setEditAmount(currentAmount);
    setEditRecurring(currentRecurring || 'none');
  };

  const saveEdit = (taskId: string) => {
    if (!editTitle.trim()) {
      alert("Please enter a task title");
      return;
    }

    updateTask(taskId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      amount: Math.max(0, editAmount),
      recurring: editRecurring,
    });

    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditAmount(1);
    setEditRecurring('none');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditAmount(1);
  };

  if (!activeChildId) {
    return (
      <div className="bg-white rounded shadow p-6">
        <p className="text-gray-500 text-center py-8">
          Select a child to manage tasks
        </p>
      </div>
    );
  }

  const tasks = getTasksByChildAndType(activeChildId, "earning");
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalEarned = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Task</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Clean bedroom, Do homework"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about the task (optional)"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward Amount 💰
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.valueAsNumber)}
              placeholder="1"
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurrence 🔄
            </label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as 'none' | 'daily')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">One-time only</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition"
          >
            <Plus size={18} /> Add Task
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="bg-white rounded shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Tasks</h2>
          <div className="flex gap-4 text-sm">
            <div className="bg-blue-50 px-3 py-2 rounded">
              <span className="text-gray-600">Completed: </span>
              <span className="font-bold text-blue-600">
                {completedCount}/{tasks.length}
              </span>
            </div>
            <div className="bg-green-50 px-3 py-2 rounded">
              <span className="text-gray-600">Earned: </span>
              <span className="font-bold text-green-600">💰 {totalEarned}</span>
            </div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tasks yet. Create one to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`rounded border transition ${
                  task.completed
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                {editingId === task.id ? (
                  // Edit mode
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Task title"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                      placeholder="Description (optional)"
                    />
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.valueAsNumber)}
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Reward amount"
                    />
                    <select
                      value={editRecurring}
                      onChange={(e) => setEditRecurring(e.target.value as 'none' | 'daily')}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">One-time only</option>
                      <option value="daily">Daily</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-medium"
                      >
                        <Save size={16} /> Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded font-medium"
                      >
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-green-500 transition p-1"
                      title={
                        task.completed ? "Mark as incomplete" : "Mark as complete"
                      }
                    >
                      {task.completed ? (
                        <CheckCircle2 size={24} className="text-green-500" />
                      ) : (
                        <Circle size={24} />
                      )}
                    </button>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-medium ${
                            task.completed ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.recurring === 'daily' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap">
                            <Repeat2 size={12} /> Daily
                          </span>
                        )}
                        {task.isRecurringInstance && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded whitespace-nowrap">
                            Today
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-semibold text-green-600 whitespace-nowrap">
                        💰 {task.amount}
                      </span>
                      <button
                        onClick={() =>
                          startEdit(
                            task.id,
                            task.title,
                            task.description,
                            task.amount,
                            task.recurring
                          )
                        }
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit task"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
