import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Plus, CheckCircle2, Circle, Trash2, Edit2, Save, X, Repeat2 } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
const ActivitiesView = () => {
    const { activeChildId, addTask, toggleTask, removeTask, updateTask, getTasksByChildAndType, getAvailableBalance, } = useTaskStore();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [cost, setCost] = useState(1);
    const [recurring, setRecurring] = useState('none');
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editCost, setEditCost] = useState(1);
    const [editRecurring, setEditRecurring] = useState('none');
    const handleAddActivity = (e) => {
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
    const startEdit = (activityId, currentTitle, currentDescription, currentCost, currentRecurring) => {
        setEditingId(activityId);
        setEditTitle(currentTitle);
        setEditDescription(currentDescription || "");
        setEditCost(currentCost);
        setEditRecurring(currentRecurring || 'none');
    };
    const saveEdit = (activityId) => {
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
        return (_jsx("div", { className: "bg-white rounded shadow p-6", children: _jsx("p", { className: "text-gray-500 text-center py-8", children: "Select a child to manage activities" }) }));
    }
    const activities = getTasksByChildAndType(activeChildId, "spending");
    const spentCount = activities.filter((a) => a.completed).length;
    const totalSpent = activities
        .filter((a) => a.completed)
        .reduce((sum, a) => sum + a.amount, 0);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gradient-to-r from-purple-500 to-purple-600 rounded shadow p-6 text-white", children: [_jsx("p", { className: "text-sm font-medium opacity-90", children: "Available Balance" }), _jsxs("p", { className: "text-4xl font-bold mt-2", children: ["\uD83D\uDCB0 ", availableBalance] }), _jsx("p", { className: "text-xs opacity-75 mt-2", children: "Spend earned rewards on fun activities!" })] }), _jsxs("form", { onSubmit: handleAddActivity, className: "bg-white rounded shadow p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Add New Activity" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Activity Title *" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g., Movie night, Ice cream, Video game time", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Add details about the activity (optional)", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none", rows: 2 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Cost \uD83D\uDCB8" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "number", value: cost, onChange: (e) => setCost(e.target.valueAsNumber), placeholder: "1", min: "0", step: "0.5", max: availableBalance, className: "flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500" }), _jsx("div", { className: "flex items-center px-3 py-2 bg-gray-100 rounded", children: _jsxs("span", { className: "text-sm text-gray-600", children: ["Max: ", availableBalance] }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Recurrence \uD83D\uDD04" }), _jsxs("select", { value: recurring, onChange: (e) => setRecurring(e.target.value), className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500", children: [_jsx("option", { value: "none", children: "One-time only" }), _jsx("option", { value: "daily", children: "Daily" })] })] }), _jsxs("button", { type: "submit", className: "w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium transition", children: [_jsx(Plus, { size: 18 }), " Add Activity"] })] })] }), _jsxs("div", { className: "bg-white rounded shadow p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Activities" }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("div", { className: "bg-purple-50 px-3 py-2 rounded", children: [_jsx("span", { className: "text-gray-600", children: "Completed: " }), _jsxs("span", { className: "font-bold text-purple-600", children: [spentCount, "/", activities.length] })] }), _jsxs("div", { className: "bg-red-50 px-3 py-2 rounded", children: [_jsx("span", { className: "text-gray-600", children: "Spent: " }), _jsxs("span", { className: "font-bold text-red-600", children: ["\uD83D\uDCB8 ", totalSpent] })] })] })] }), activities.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No activities yet. Create one to spend rewards!" })) : (_jsx("div", { className: "space-y-2", children: activities.map((activity) => (_jsx("div", { className: `rounded border transition ${activity.completed
                                ? "bg-red-50 border-red-200"
                                : "bg-gray-50 border-gray-200 hover:border-gray-300"}`, children: editingId === activity.id ? (
                            // Edit mode
                            _jsxs("div", { className: "p-4 space-y-3", children: [_jsx("input", { type: "text", value: editTitle, onChange: (e) => setEditTitle(e.target.value), className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500", placeholder: "Activity title" }), _jsx("textarea", { value: editDescription, onChange: (e) => setEditDescription(e.target.value), className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none", rows: 2, placeholder: "Description (optional)" }), _jsx("input", { type: "number", value: editCost, onChange: (e) => setEditCost(e.target.valueAsNumber), min: "0", step: "0.5", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500", placeholder: "Activity cost" }), _jsxs("select", { value: editRecurring, onChange: (e) => setEditRecurring(e.target.value), className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500", children: [_jsx("option", { value: "none", children: "One-time only" }), _jsx("option", { value: "daily", children: "Daily" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => saveEdit(activity.id), className: "flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-medium", children: [_jsx(Save, { size: 16 }), " Save"] }), _jsxs("button", { onClick: cancelEdit, className: "flex-1 flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded font-medium", children: [_jsx(X, { size: 16 }), " Cancel"] })] })] })) : (
                            // Display mode
                            _jsxs("div", { className: "flex items-center gap-3 p-4", children: [_jsx("button", { onClick: () => toggleTask(activity.id), className: "flex-shrink-0 text-gray-400 hover:text-red-500 transition p-1", title: activity.completed
                                            ? "Mark as incomplete"
                                            : "Mark as spent", children: activity.completed ? (_jsx(CheckCircle2, { size: 24, className: "text-red-500" })) : (_jsx(Circle, { size: 24 })) }), _jsxs("div", { className: "flex-grow min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("h3", { className: `font-medium ${activity.completed ? "line-through text-gray-500" : ""}`, children: activity.title }), activity.recurring === 'daily' && (_jsxs("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap", children: [_jsx(Repeat2, { size: 12 }), " Daily"] })), activity.isRecurringInstance && (_jsx("span", { className: "text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded whitespace-nowrap", children: "Today" }))] }), activity.description && (_jsx("p", { className: "text-sm text-gray-500", children: activity.description }))] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsxs("span", { className: "font-semibold text-red-600 whitespace-nowrap", children: ["\uD83D\uDCB8 ", activity.amount] }), _jsx("button", { onClick: () => startEdit(activity.id, activity.title, activity.description, activity.amount, activity.recurring), className: "text-blue-500 hover:text-blue-700 p-1", title: "Edit activity", children: _jsx(Edit2, { size: 18 }) }), _jsx("button", { onClick: () => removeTask(activity.id), className: "text-red-500 hover:text-red-700 p-1", title: "Delete activity", children: _jsx(Trash2, { size: 18 }) })] })] })) }, activity.id))) }))] })] }));
};
export default ActivitiesView;
