import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart3, ListTodo, Gift, History } from "lucide-react";
const Navigation = ({ activeView, onViewChange, }) => {
    const navItems = [
        { id: "dashboard", label: "Earnings", icon: BarChart3 },
        { id: "tasks", label: "Tasks", icon: ListTodo },
        { id: "activities", label: "Activities", icon: Gift },
        { id: "history", label: "History", icon: History },
    ];
    return (_jsx("nav", { className: "bg-white border-b border-gray-200 shadow", children: _jsx("div", { className: "max-w-4xl mx-auto px-4", children: _jsx("div", { className: "flex gap-1", children: navItems.map(({ id, label, icon: Icon }) => (_jsxs("button", { onClick: () => onViewChange(id), className: `flex items-center gap-2 px-4 py-3 font-medium transition ${activeView === id
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent"}`, children: [_jsx(Icon, { size: 18 }), _jsx("span", { className: "hidden sm:inline", children: label })] }, id))) }) }) }));
};
export default Navigation;
