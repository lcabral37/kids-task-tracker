import React, { useEffect, useState } from 'react';
import { registerServiceWorker } from './services/swRegister';
import { useTaskStore } from './store/taskStore';
import ChildSelector from './components/ChildList';
import Navigation, { ViewType } from './components/Navigation';
import TasksView from './components/TasksView';
import ActivitiesView from './components/ActivitiesView';
import EarningsDashboardView from './components/EarningsDashboardView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const { refreshDailyTasks } = useTaskStore();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  useEffect(() => {
    // Register service worker for offline support
    registerServiceWorker('/sw.js');

    // Refresh daily recurring tasks on each app load
    refreshDailyTasks();
  }, [refreshDailyTasks]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <EarningsDashboardView />;
      case 'tasks':
        return <TasksView />;
      case 'activities':
        return <ActivitiesView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
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
