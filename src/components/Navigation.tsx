import React from 'react';
import { BarChart3, ListTodo, Gift, History, Settings } from 'lucide-react';

export type ViewType = 'dashboard' | 'tasks' | 'activities' | 'history' | 'settings';

interface NavigationProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
    const navItems = [
        { id: 'dashboard', label: 'Earnings', icon: BarChart3 },
        { id: 'tasks', label: 'Tasks', icon: ListTodo },
        { id: 'activities', label: 'Activities', icon: Gift },
        { id: 'history', label: 'History', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const;

    return (
        <nav className="bg-white border-b border-gray-200 shadow">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex gap-1 overflow-x-auto">
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => onViewChange(id)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition whitespace-nowrap ${
                                activeView === id
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                            }`}
                        >
                            <Icon size={18} />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
