import React, { useEffect, useState } from "react";
import { registerServiceWorker } from "./services/swRegister";
import { useTaskStore } from "./store/taskStore";
import db from "./db/database";
import ChildSelector from "./components/ChildList";
import Navigation, { ViewType } from "./components/Navigation";
import TasksView from "./components/TasksView";
import ActivitiesView from "./components/ActivitiesView";
import EarningsDashboardView from "./components/EarningsDashboardView";
import HistoryView from "./components/HistoryView";

const App: React.FC = () => {
  const { children: storeChildren, tasks: storeTasks, addChild, addTask, refreshDailyTasks } =
    useTaskStore();
  const [activeView, setActiveView] = useState<ViewType>("dashboard");

  useEffect(() => {
    // Register service worker for offline support
    registerServiceWorker("/sw.js");

    // Refresh daily recurring tasks
    refreshDailyTasks();

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
                type: "earning",
              });
            }
          });
        }
      } catch (error) {
        console.error("Failed to load data from database:", error);
      }
    };

    loadData();
  }, []);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <EarningsDashboardView />;
      case "tasks":
        return <TasksView />;
      case "activities":
        return <ActivitiesView />;
      case "history":
        return <HistoryView />;
      default:
        return <EarningsDashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">🎯 Kids Task Tracker</h1>
          <p className="text-blue-100 mt-1">Earn rewards and unlock activities!</p>
        </div>
      </header>

      <Navigation activeView={activeView} onViewChange={setActiveView} />

      <main className="max-w-4xl mx-auto p-4 py-6">
        <ChildSelector />
        <div className="mt-6">{renderView()}</div>
      </main>

      <footer className="bg-gray-800 text-gray-400 p-4 text-center mt-8">
        <p className="text-sm">
          © 2026 Kids Task Tracker • Works offline with PWA 📱
        </p>
      </footer>
    </div>
  );
};

export default App;
