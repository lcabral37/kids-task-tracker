import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
const TaskForm = () => {
    const { activeChildId, addTask } = useTaskStore();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(1);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!activeChildId) {
            alert("Please select a child first");
            return;
        }
        if (!title.trim()) {
            alert("Please enter a task title");
            return;
        }
        const newTask = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            amount: Math.max(0, amount),
            completed: false,
            childId: activeChildId,
            date: new Date().toISOString().split("T")[0],
        };
        addTask(newTask);
        setTitle("");
        setDescription("");
        setAmount(1);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "bg-white rounded shadow p-6 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-4", children: "Add New Task" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Task Title *" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g., Clean bedroom, Do homework", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Add details about the task (optional)", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none", rows: 2 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Reward Amount \uD83D\uDCB0" }), _jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(e.target.valueAsNumber), placeholder: "1", min: "0", step: "0.5", className: "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Amount to earn when task is completed" })] }), _jsxs("button", { type: "submit", disabled: !activeChildId, className: "w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition", children: [_jsx(Plus, { size: 18 }), " Add Task"] })] })] }));
};
export default TaskForm;
