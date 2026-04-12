import React, { useState } from "react";
import { Plus, CheckCircle2, Circle, Trash2, Edit2, Save, X, Repeat2 } from "lucide-react";
import { useTaskStore } from "../store/taskStore";

const ActivitiesView: React.FC = () => {
  const {
    activeChildId,
    addTask,
    toggleTask,
    removeTask,
    updateTask,
    getTasksByChildAndType,
    getAvailableBalance,
  } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(1);
  const [recurring, setRecurring] = useState<'none' | 'daily'>('none');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCost, setEditCost] = useState(1);
  const [editRecurring, setEditRecurring] = useState<'none' | 'daily'>('none');

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeChildId) {
      alert("Please select a child first");
      return;
    }

    if (!title.trim()) {
      alert("Please enter an activity title");
      return;
    }

    addTask({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      amount: Math.max(0, cost),
      completed: false,
      childId: activeChildId,
      date: new Date().toISOString().split("T")[0],
      type: "spending",
      recurring: recurring,
    });

    setTitle("");
    setDescription("");
    setCost(1);
    setRecurring('none');
  };

  const startEdit = (activityId: string, currentTitle: string, currentDescription: string | undefined, currentCost: number, currentRecurring?: 'none' | 'daily') => {
    setEditingId(activityId);
    setEditTitle(currentTitle);
    setEditDescription(currentDescription || "");
    setEditCost(currentCost);
    setEditRecurring(currentRecurring || 'none');
  };

  const saveEdit = (activityId: string) => {
    if (!editTitle.trim()) {
      alert("Please enter an activity title");
      return;
    }

    updateTask(activityId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      amount: Math.max(0, editCost),
      recurring: editRecurring,
    });

    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditCost(1);
    setEditRecurring('none');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditCost(1);
    setEditRecurring('none');
  };

  const availableBalance = getAvailableBalance();

  if (!activeChildId) {
    return (
      <div className="bg-white rounded shadow p-6">
        <p className="text-gray-500 text-center py-8">
          Select a child to manage activities
        </p>
      </div>
    );
  }

  const activities = getTasksByChildAndType(activeChildId, "spending");
  const spentCount = activities.filter((a) => a.completed).length;
  const totalSpent = activities
    .filter((a) => a.completed)
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-6">
      {/* Activity Info */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded shadow p-6 text-white">
        <p className="text-sm font-medium opacity-90">Available Balance</p>
        <p className="text-4xl font-bold mt-2">💰 {availableBalance}</p>
        <p className="text-xs opacity-75 mt-2">
          Spend earned rewards on fun activities!
        </p>
      </div>

      {/* Add Activity Form */}
      <form
        onSubmit={handleAddActivity}
        className="bg-white rounded shadow p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Add New Activity</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Movie night, Ice cream, Video game time"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              placeholder="Add details about the activity (optional)"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost 💸
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.valueAsNumber)}
                placeholder="1"
                min="0"
                step="0.5"
                max={availableBalance}
                className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex items-center px-3 py-2 bg-gray-100 rounded">
                <span className="text-sm text-gray-600">
                  Max: {availableBalance}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurrence 🔄
            </label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as 'none' | 'daily')}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none">One-time only</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium transition"
          >
            <Plus size={18} /> Add Activity
          </button>
        </div>
      </form>

      {/* Activities List */}
      <div className="bg-white rounded shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Activities</h2>
          <div className="flex gap-4 text-sm">
            <div className="bg-purple-50 px-3 py-2 rounded">
              <span className="text-gray-600">Completed: </span>
              <span className="font-bold text-purple-600">
                {spentCount}/{activities.length}
              </span>
            </div>
            <div className="bg-red-50 px-3 py-2 rounded">
              <span className="text-gray-600">Spent: </span>
              <span className="font-bold text-red-600">💸 {totalSpent}</span>
            </div>
          </div>
        </div>

        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No activities yet. Create one to spend rewards!
          </p>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`rounded border transition ${
                  activity.completed
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
              >
                {editingId === activity.id ? (
                  // Edit mode
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Activity title"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={2}
                      placeholder="Description (optional)"
                    />
                    <input
                      type="number"
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.valueAsNumber)}
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Activity cost"
                    />
                    <select
                      value={editRecurring}
                      onChange={(e) => setEditRecurring(e.target.value as 'none' | 'daily')}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="none">One-time only</option>
                      <option value="daily">Daily</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(activity.id)}
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
                      onClick={() => toggleTask(activity.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-red-500 transition p-1"
                      title={
                        activity.completed
                          ? "Mark as incomplete"
                          : "Mark as spent"
                      }
                    >
                      {activity.completed ? (
                        <CheckCircle2 size={24} className="text-red-500" />
                      ) : (
                        <Circle size={24} />
                      )}
                    </button>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-medium ${
                            activity.completed ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {activity.title}
                        </h3>
                        {activity.recurring === 'daily' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap">
                            <Repeat2 size={12} /> Daily
                          </span>
                        )}
                        {activity.isRecurringInstance && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded whitespace-nowrap">
                            Today
                          </span>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-semibold text-red-600 whitespace-nowrap">
                        💸 {activity.amount}
                      </span>
                      <button
                        onClick={() =>
                          startEdit(
                            activity.id,
                            activity.title,
                            activity.description,
                            activity.amount,
                            activity.recurring
                          )
                        }
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit activity"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => removeTask(activity.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete activity"
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

export default ActivitiesView;
