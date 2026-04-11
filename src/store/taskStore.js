import create from "zustand";
export const useTaskStore = create((set) => ({
    children: [],
    tasks: [],
    dailyEarnings: 0,
    addChild: (name) => set((state) => ({ children: [...state.children, name] })),
    addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
    completeTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) => task.id === id ? { ...task, completed: true } : task),
    })),
    setDailyEarnings: (amount) => set({ dailyEarnings: amount }),
}));
