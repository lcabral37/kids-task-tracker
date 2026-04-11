import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { useTaskStore } from "../store/taskStore";
const TaskList = () => {
    const { activeChildId, tasks, completeTask, removeTask, getTasksByChild } = useTaskStore();
    if (!activeChildId) {
        return (_jsx("div", { className: "bg-white rounded shadow p-6", children: _jsx("p", { className: "text-gray-500 text-center py-8", children: "Select a child to see their tasks" }) }));
    }
    const childTasks = getTasksByChild(activeChildId);
    const completedCount = childTasks.filter((t) => t.completed).length;
    const totalEarned = childTasks
        .filter((t) => t.completed)
        .reduce((sum, t) => sum + t.amount, 0);
    return (_jsxs("div", { className: "bg-white rounded shadow p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Tasks" }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("div", { className: "bg-blue-50 px-3 py-2 rounded", children: [_jsx("span", { className: "text-gray-600", children: "Completed: " }), _jsxs("span", { className: "font-bold text-blue-600", children: [completedCount, "/", childTasks.length] })] }), _jsxs("div", { className: "bg-green-50 px-3 py-2 rounded", children: [_jsx("span", { className: "text-gray-600", children: "Earned: " }), _jsxs("span", { className: "font-bold text-green-600", children: ["\uD83D\uDCB0 ", totalEarned] })] })] })] }), childTasks.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No tasks yet. Create one to get started!" })) : (_jsx("div", { className: "space-y-2", children: childTasks.map((task) => (_jsxs("div", { className: `flex items-center gap-3 p-3 rounded border transition ${task.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"}`, children: [_jsx("button", { onClick: () => completeTask(task.id), className: "flex-shrink-0 text-gray-400 hover:text-green-500 transition", title: task.completed ? "Task completed" : "Mark as complete", children: task.completed ? (_jsx(CheckCircle2, { size: 24, className: "text-green-500" })) : (_jsx(Circle, { size: 24 })) }), _jsxs("div", { className: "flex-grow min-w-0", children: [_jsx("h3", { className: `font-medium ${task.completed ? "line-through text-gray-500" : ""}`, children: task.title }), task.description && (_jsx("p", { className: "text-sm text-gray-500", children: task.description }))] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsxs("span", { className: "font-semibold text-green-600 whitespace-nowrap", children: ["\uD83D\uDCB0 ", task.amount] }), _jsx("button", { onClick: () => removeTask(task.id), className: "text-red-500 hover:text-red-700 p-1", title: "Delete task", children: _jsx(Trash2, { size: 18 }) })] })] }, task.id))) }))] }));
};
export default TaskList;
