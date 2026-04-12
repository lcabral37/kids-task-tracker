import React, { useState } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import DateNavigator from "./DateNavigator";
import TaskEditPanel from "./TaskEditPanel";

const TasksView: React.FC = () => {
  const { activeChildId, addTask, toggleTask, decrementTask, removeTask, updateTask, getTasksByChildAndType } =
    useTaskStore();
  
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!activeChildId) {
    return (
      <div className="bg-white rounded shadow p-6">
        <p className="text-gray-500 text-center py-8">Select a child to manage tasks</p>
      </div>
    );
  }

  const allTasks = getTasksByChildAndType(activeChildId, "earning");
  const tasksForDisplay = allTasks.filter((t) => t.date === selectedDate);

  const completedCount = tasksForDisplay.filter((t) => t.completionCount > 0).length;
  const totalEarned = tasksForDisplay.reduce((sum, t) => sum + t.amount * t.completionCount, 0);
  const totalCompletions = tasksForDisplay.reduce((sum, t) => sum + t.completionCount, 0);

  const handleAddTask = (data: { title: string; description: string; amount: number; icon: string }) => {
    // Create a template task (no templateId means it's a template)
    // We use a special marker date to indicate this is a template
    const templateId = Date.now().toString();
    addTask({
      id: templateId,
      title: data.title,
      description: data.description,
      amount: Math.max(0, data.amount),
      completionCount: 0,
      childId: activeChildId,
      date: "template", // Marker indicating this is a template
      type: "earning",
      icon: data.icon,
    });
    setIsAddingNew(false);
  };

  const handleEditTask = (taskId: string, data: { title: string; description: string; amount: number; icon: string }) => {
    updateTask(taskId, {
      title: data.title,
      description: data.description,
      amount: Math.max(0, data.amount),
      icon: data.icon,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded p-4 border border-blue-200">
          <p className="text-sm text-gray-600">Tasks with Completions</p>
          <p className="text-2xl font-bold text-blue-600">
            {completedCount}/{tasksForDisplay.length}
          </p>
        </div>
        <div className="bg-green-50 rounded p-4 border border-green-200">
          <p className="text-sm text-gray-600">Total Earned</p>
          <p className="text-2xl font-bold text-green-600">💰 {totalEarned}</p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tasks for {new Date(selectedDate).toLocaleDateString()}</h2>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded font-medium transition"
          >
            <Plus size={18} /> Add Task
          </button>
        </div>

        {tasksForDisplay.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks for this day. Add one to get started!</p>
        ) : (
          <div className="space-y-2">
            {tasksForDisplay.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 rounded border bg-gray-50 border-gray-200 hover:border-gray-300 transition"
              >
                <span className="text-2xl">{task.icon || "⭐"}</span>

                <div className="flex-grow min-w-0">
                  <h3 className="font-medium">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-500">{task.description}</p>
                  )}
                </div>

                {/* Counter Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => decrementTask(task.id)}
                    disabled={task.completionCount === 0}
                    className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 hover:text-red-700 transition"
                    title="Decrease count"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="font-bold text-lg w-8 text-center">{task.completionCount}</span>
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 hover:bg-green-50 text-green-600 hover:text-green-700 transition"
                    title="Increase count"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="font-semibold text-green-600 whitespace-nowrap">
                    💰 {task.amount}
                  </span>
                  <button
                    onClick={() => setEditingId(task.id)}
                    className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition"
                    title="Edit task"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
                    title="Delete task"
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
            const task = tasksForDisplay.find((t) => t.id === editingId);
            if (task) {
              handleEditTask(editingId, data);
            }
          }}
          initialData={
            tasksForDisplay.find((t) => t.id === editingId)
              ? {
                  title: tasksForDisplay.find((t) => t.id === editingId)?.title || "",
                  description: tasksForDisplay.find((t) => t.id === editingId)?.description || "",
                  amount: tasksForDisplay.find((t) => t.id === editingId)?.amount || 1,
                  icon: tasksForDisplay.find((t) => t.id === editingId)?.icon || "⭐",
                }
              : undefined
          }
          title="Edit Task"
          type="earning"
        />
      )}

      {/* Add Panel */}
      <TaskEditPanel
        isOpen={isAddingNew}
        onClose={() => setIsAddingNew(false)}
        onSave={handleAddTask}
        title="Add New Task"
        type="earning"
      />
    </div>
  );
};

export default TasksView;
