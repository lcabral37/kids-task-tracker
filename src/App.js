import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { registerServiceWorker } from "./services/swRegister";
import { useTaskStore } from "./store/taskStore";
import db from "./db/database";
import ChildSelector from "./components/ChildList";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import EarningsDashboard from "./components/EarningsDashboard";
const App = () => {
    const { children: storeChildren, tasks: storeTasks, addChild, addTask } = useTaskStore();
    useEffect(() => {
        // Register service worker for offline support
        registerServiceWorker("/sw.js");
        // Load persisted data from Dexie on app start
        const loadData = async () => {
            try {
                const children = await db.children.toArray();
                const tasks = await db.tasks.toArray();
                if (children.length > 0) {
                    children.forEach((child) => {
                        if (!storeChildren.find((c) => c.id === child.id?.toString())) {
                            addChild({
                                id: child.id?.toString() || "",
                                name: child.name,
                                age: child.age,
                            });
                        }
                    });
                }
                if (tasks.length > 0) {
                    tasks.forEach((task) => {
                        if (!storeTasks.find((t) => t.id === task.id?.toString())) {
                            addTask({
                                id: task.id?.toString() || "",
                                title: task.title,
                                description: task.description,
                                amount: 0,
                                completed: task.isCompleted,
                                childId: task.childId?.toString() || "",
                                date: new Date().toISOString().split("T")[0],
                            });
                        }
                    });
                }
            }
            catch (error) {
                console.error("Failed to load data from database:", error);
            }
        };
        loadData();
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 shadow-lg", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold", children: "\uD83C\uDFAF Kids Task Tracker" }), _jsx("p", { className: "text-blue-100 mt-1", children: "Track tasks and earn rewards!" })] }) }), _jsxs("main", { className: "max-w-4xl mx-auto p-4 py-6", children: [_jsx(EarningsDashboard, {}), _jsx(ChildSelector, {}), _jsx(TaskForm, {}), _jsx(TaskList, {})] }), _jsx("footer", { className: "bg-gray-800 text-gray-400 p-4 text-center mt-8", children: _jsx("p", { className: "text-sm", children: "\u00A9 2026 Kids Task Tracker \u2022 Works offline with PWA \uD83D\uDCF1" }) })] }));
};
export default App;
