import create from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
    id: string;
    title: string;
    description?: string;
    amount: number;
    completed: boolean;
    childId: string;
    date: string;
    completedDate?: string;
}

export interface Child {
    id: string;
    name: string;
    age: number;
}

interface TaskStore {
    children: Child[];
    tasks: Task[];
    activeChildId: string | null;
    addChild: (child: Child) => void;
    removeChild: (id: string) => void;
    addTask: (task: Task) => void;
    completeTask: (id: string) => void;
    removeTask: (id: string) => void;
    setActiveChild: (id: string) => void;
    getDailyEarnings: (date: string) => number;
    getTotalEarnings: () => number;
    getTasksByChild: (childId: string) => Task[];
    updateTask: (id: string, updates: Partial<Task>) => void;
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            children: [],
            tasks: [],
            activeChildId: null,

            addChild: (child) =>
                set((state) => ({
                    children: [...state.children, child],
                    activeChildId: state.activeChildId || child.id,
                })),

            removeChild: (id) =>
                set((state) => ({
                    children: state.children.filter((c) => c.id !== id),
                    activeChildId: state.activeChildId === id ? null : state.activeChildId,
                })),

            addTask: (task) =>
                set((state) => ({
                    tasks: [...state.tasks, task],
                })),

            removeTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                })),

            completeTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id
                            ? { ...task, completed: true, completedDate: new Date().toISOString().split('T')[0] }
                            : task
                    ),
                })),

            updateTask: (id, updates) =>
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id ? { ...task, ...updates } : task
                    ),
                })),

            setActiveChild: (id) => set({ activeChildId: id }),

            getDailyEarnings: (date) => {
                const state = get();
                return state.tasks
                    .filter((t) => t.completed && t.completedDate === date)
                    .reduce((sum, t) => sum + t.amount, 0);
            },

            getTotalEarnings: () => {
                const state = get();
                return state.tasks
                    .filter((t) => t.completed)
                    .reduce((sum, t) => sum + t.amount, 0);
            },

            getTasksByChild: (childId) => {
                const state = get();
                return state.tasks.filter((t) => t.childId === childId);
            },
        }),
        {
            name: 'task-store',
        }
    )
);