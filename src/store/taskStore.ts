import create from 'zustand';

interface TaskStore {
    children: string[];
    tasks: { id: string; title: string; completed: boolean }[];
    dailyEarnings: number;
    addChild: (name: string) => void;
    addTask: (task: { id: string; title: string; completed: boolean }) => void;
    completeTask: (id: string) => void;
    setDailyEarnings: (amount: number) => void;
}

export const useTaskStore = create<TaskStore>(set => ({
    children: [],
    tasks: [],
    dailyEarnings: 0,
    addChild: (name) => set(state => ({ children: [...state.children, name] })),
    addTask: (task) => set(state => ({ tasks: [...state.tasks, task] })),
    completeTask: (id) => set(state => ({
        tasks: state.tasks.map(task => 
            task.id === id ? { ...task, completed: true } : task
        )
    })),
    setDailyEarnings: (amount) => set({ dailyEarnings: amount })
}));