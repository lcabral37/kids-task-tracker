import React, { useState } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import DateNavigator from "./DateNavigator";
import TaskEditPanel from "./TaskEditPanel";

const ActivitiesView: React.FC = () => {
  const { activeChildId, addTask, toggleTask, decrementTask, removeTask, updateTask, getTasksByChildAndType, getAvailableBalance } =
    useTaskStore();
  
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!activeChildId) {
    return (
      <div className="bg-white rounded shadow p-6">
        <p className="text-gray-500 text-center py-8">Select a child to manage activities</p>
      </div>
    );
  }

  const allActivities = getTasksByChildAndType(activeChildId, "spending");
  const activitiesForDate = allActivities.filter((t) => t.date === selectedDate);

  const completedCount = activitiesForDate.filter((t) => t.completionCount > 0).length;
  const totalSpent = activitiesForDate.reduce((sum, t) => sum + t.amount * t.completionCount, 0);

  const handleAddActivity = (data: { title: string; description: string; amount: number; icon: string }) => {
    // Create a template activity (date === "template")
    const templateId = Date.now().toString();
    addTask({
      id: templateId,
      title: data.title,
      description: data.description,
      amount: Math.max(0, data.amount),
      completionCount: 0,
      childId: activeChildId,
      date: "template", // Marker indicating this is a template
      type: "spending",
      icon: data.icon,
    });
    setIsAddingNew(false);
  };

  const handleEditActivity = (activityId: string, data: { title: string; description: string; amount: number; icon: string }) => {
    updateTask(activityId, {
      title: data.title,
      description: data.description,
      amount: Math.max(0, data.amount),
      icon: data.icon,
    });
    setEditingId(null);
  };

  const availableBalance = getAvailableBalance();

  return (
    <div className="space-y-4">
      <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Balance Info */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded shadow p-6 text-white">
        <p className="text-sm font-medium opacity-90">Available Balance</p>
        <p className="text-4xl font-bold mt-2">💰 {availableBalance}</p>
        <p className="text-xs opacity-75 mt-2">Spend earned rewards on fun activities!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 rounded p-4 border border-red-200">
          <p className="text-sm text-gray-600">Activities Done</p>
          <p className="text-2xl font-bold text-red-600">
            {completedCount}/{activitiesForDate.length}
          </p>
        </div>
        <div className="bg-orange-50 rounded p-4 border border-orange-200">
          <p className="text-sm text-gray-600">Total Spent</p>
          <p className="text-2xl font-bold text-orange-600">💸 {totalSpent}</p>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Activities for {new Date(selectedDate).toLocaleDateString()}</h2>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded font-medium transition"
          >
            <Plus size={18} /> Add Activity
          </button>
        </div>

        {activitiesForDate.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activities for this day. Add one to spend rewards!</p>
        ) : (
          <div className="space-y-2">
            {activitiesForDate.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-4 rounded border bg-gray-50 border-gray-200 hover:border-gray-300 transition"
              >
                <span className="text-2xl">{activity.icon || "🎁"}</span>

                <div className="flex-grow min-w-0">
                  <h3 className="font-medium">{activity.title}</h3>
                  {activity.description && (
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  )}
                </div>

                {/* Counter Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => decrementTask(activity.id)}
                    disabled={activity.completionCount === 0}
                    className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 hover:text-red-700 transition"
                    title="Decrease count"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="font-bold text-lg w-8 text-center">{activity.completionCount}</span>
                  <button
                    onClick={() => toggleTask(activity.id)}
                    className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:bg-green-50 text-green-600 hover:text-green-700 transition"
                    title="Increase count"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Cost & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="font-semibold text-red-600 whitespace-nowrap">
                    💸 {activity.amount}
                  </span>
                  <button
                    onClick={() => setEditingId(activity.id)}
                    className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition"
                    title="Edit activity"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => removeTask(activity.id)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
                    title="Delete activity"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Panel */}
      {editingId && (
        <TaskEditPanel
          isOpen={true}
          onClose={() => setEditingId(null)}
          onSave={(data) => {
            const activity = activitiesForDate.find((t) => t.id === editingId);
            if (activity) {
              handleEditActivity(editingId, data);
            }
          }}
          initialData={
            activitiesForDate.find((t) => t.id === editingId)
              ? {
                  title: activitiesForDate.find((t) => t.id === editingId)?.title || "",
                  description: activitiesForDate.find((t) => t.id === editingId)?.description || "",
                  amount: activitiesForDate.find((t) => t.id === editingId)?.amount || 1,
                  icon: activitiesForDate.find((t) => t.id === editingId)?.icon || "🎁",
                }
              : undefined
          }
          title="Edit Activity"
          type="spending"
        />
      )}

      {/* Add Panel */}
      <TaskEditPanel
        isOpen={isAddingNew}
        onClose={() => setIsAddingNew(false)}
        onSave={handleAddActivity}
        title="Add New Activity"
        type="spending"
      />
    </div>
  );
};

export default ActivitiesView;
