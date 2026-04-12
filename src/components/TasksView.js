import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Plus, CheckCircle2, Circle, Trash2, Edit2, Save, X, Repeat2 } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
const TasksView = () => {
    const { activeChildId, addTask, toggleTask, removeTask, updateTask, getTasksByChildAndType, } = useTaskStore();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(1);
    const [recurring, setRecurring] = useState('none');
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editAmount, setEditAmount] = useState(1);
    const [editRecurring, setEditRecurring] = useState('none');
    const handleAddTask = (e) => {
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
    const startEdit = (taskId, currentTitle, currentDescription, currentAmount, currentRecurring) => {
        setEditingId(taskId);
        setEditTitle(currentTitle);
        setEditDescription(currentDescription || "");
        setEditAmount(currentAmount);
        setEditRecurring(currentRecurring || 'none');
    };
    const saveEdit = (taskId) => {
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
        return (_jsx("div", { className: "bg-white rounded shadow p-6", children: _jsx("p", { className: "text-gray-500 text-center py-8", children: "Select a child to manage tasks" }) }));
    }
    const tasks = getTasksByChildAndType(activeChildId, "earning");
    const completedCount = tasks.filter((t) => t.completed).length;
    const totalEarned = tasks
        .filter((t) => t.completed)
        .reduce((sum, t) => sum + t.amount, 0);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("form", { onSubmit: handleAddTask, className: "bg-white rounded shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Add New Task" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Task Title *" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g., Clean bedroom, Do homework", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Add details about the task (optional)", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", rows: 2 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Reward Amount \uD83D\uDCB0" }), _jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(e.target.valueAsNumber), placeholder: "1", min: "0", step: "0.5", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Recurrence \uD83D\uDD04" }), _jsxs("select", { value: recurring, onChange: (e) => setRecurring(e.target.value), className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "none", children: "One-time only" }), _jsx("option", { value: "daily", children: "Daily" })] })] }), _jsxs("button", { type: "submit", className: "w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition", children: [_jsx(Plus, { size: 18 }), " Add Task"] })] })] }), _jsxs("div", { className: "bg-white rounded shadow p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Tasks" }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("div", { className: "bg-blue-50 px-3 py-2 rounded", children: [_jsx("span", { className: "text-gray-600", children: "Completed: " }), _jsxs("span", { className: "font-bold text-blue-600", children: [completedCount, "/", tasks.length] })] }), _jsxs("div", { className: "bg-green-50 px-3 py-2 rounded", children: [_jsx("span", { className: "text-gray-600", children: "Earned: " }), _jsxs("span", { className: "font-bold text-green-600", children: ["\uD83D\uDCB0 ", totalEarned] })] })] })] }), tasks.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No tasks yet. Create one to get started!" })) : (_jsx("div", { className: "space-y-2", children: tasks.map((task) => (_jsx("div", { className: `rounded border transition ${task.completed
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50 border-gray-200 hover:border-gray-300"}`, children: editingId === task.id ? (
                            // Edit mode
                            _jsxs("div", { className: "p-4 space-y-3", children: [_jsx("input", { type: "text", value: editTitle, onChange: (e) => setEditTitle(e.target.value), className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Task title" }), _jsx("textarea", { value: editDescription, onChange: (e) => setEditDescription(e.target.value), className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", rows: 2, placeholder: "Description (optional)" }), _jsx("input", { type: "number", value: editAmount, onChange: (e) => setEditAmount(e.target.valueAsNumber), min: "0", step: "0.5", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Reward amount" }), _jsxs("select", { value: editRecurring, onChange: (e) => setEditRecurring(e.target.value), className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "none", children: "One-time only" }), _jsx("option", { value: "daily", children: "Daily" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => saveEdit(task.id), className: "flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-medium", children: [_jsx(Save, { size: 16 }), " Save"] }), _jsxs("button", { onClick: cancelEdit, className: "flex-1 flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded font-medium", children: [_jsx(X, { size: 16 }), " Cancel"] })] })] })) : (
                            // Display mode
                            _jsxs("div", { className: "flex items-center gap-3 p-4", children: [_jsx("button", { onClick: () => toggleTask(task.id), className: "flex-shrink-0 text-gray-400 hover:text-green-500 transition p-1", title: task.completed ? "Mark as incomplete" : "Mark as complete", children: task.completed ? (_jsx(CheckCircle2, { size: 24, className: "text-green-500" })) : (_jsx(Circle, { size: 24 })) }), _jsxs("div", { className: "flex-grow min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("h3", { className: `font-medium ${task.completed ? "line-through text-gray-500" : ""}`, children: task.title }), task.recurring === 'daily' && (_jsxs("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap", children: [_jsx(Repeat2, { size: 12 }), " Daily"] })), task.isRecurringInstance && (_jsx("span", { className: "text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded whitespace-nowrap", children: "Today" }))] }), task.description && (_jsx("p", { className: "text-sm text-gray-500", children: task.description }))] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsxs("span", { className: "font-semibold text-green-600 whitespace-nowrap", children: ["\uD83D\uDCB0 ", task.amount] }), _jsx("button", { onClick: () => startEdit(task.id, task.title, task.description, task.amount, task.recurring), className: "text-blue-500 hover:text-blue-700 p-1", title: "Edit task", children: _jsx(Edit2, { size: 18 }) }), _jsx("button", { onClick: () => removeTask(task.id), className: "text-red-500 hover:text-red-700 p-1", title: "Delete task", children: _jsx(Trash2, { size: 18 }) })] })] })) }, task.id))) }))] })] }));
};
export default TasksView;
