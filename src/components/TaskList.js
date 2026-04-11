import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const TaskList = ({ tasks, onTaskToggle }) => {
    return (_jsxs("div", { children: [_jsx("h2", { children: "Task List" }), _jsx("ul", { children: tasks.map((task) => (_jsxs("li", { children: [_jsx("input", { type: "checkbox", checked: task.completed, onChange: () => onTaskToggle(task.id) }), task.title] }, task.id))) })] }));
};
export default TaskList;
