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
    type: 'earning' | 'spending';
    recurring?: 'daily' | 'none';
    isRecurringInstance?: boolean;
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
    manualAdjustment: number;
    addChild: (child: Child) => void;
    removeChild: (id: string) => void;
    addTask: (task: Task) => void;
    completeTask: (id: string) => void;
    toggleTask: (id: string) => void;
    removeTask: (id: string) => void;
    setActiveChild: (id: string) => void;
    getDailyEarnings: (date: string) => number;
    getTotalEarnings: () => number;
    getTasksByChild: (childId: string) => Task[];
    getTasksByChildAndType: (childId: string, type: 'earning' | 'spending') => Task[];
    updateTask: (id: string, updates: Partial<Task>) => void;
    getAvailableBalance: () => number;
    getSpentToday: (date: string) => number;
    refreshDailyTasks: () => void;
    setManualAdjustment: (amount: number) => void;
    adjustBalance: (delta: number) => void;
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            children: [],
            tasks: [],
            activeChildId: null,
            manualAdjustment: 0,

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

            removeTask: (id: string) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                })),

            completeTask: (id: string) =>
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id
                            ? { ...task, completed: true, completedDate: new Date().toISOString().split('T')[0] }
                            : task
                    ),
                })),

            toggleTask: (id: string) =>
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id
                            ? {
                                ...task,
                                completed: !task.completed,
                                completedDate: !task.completed ? new Date().toISOString().split('T')[0] : undefined,
                            }
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
                    .filter((t) => t.completed && t.completedDate === date && t.type === 'earning')
                    .reduce((sum, t) => sum + t.amount, 0);
            },

            getTotalEarnings: () => {
                const state = get();
                return state.tasks
                    .filter((t) => t.completed && t.type === 'earning')
                    .reduce((sum, t) => sum + t.amount, 0);
            },

            getSpentToday: (date) => {
                const state = get();
                return state.tasks
                    .filter((t) => t.completed && t.completedDate === date && t.type === 'spending')
                    .reduce((sum, t) => sum + t.amount, 0);
            },

            getAvailableBalance: () => {
                const state = get();
                const earned = state.tasks
                    .filter((t) => t.completed && t.type === 'earning')
                    .reduce((sum, t) => sum + t.amount, 0);
                const spent = state.tasks
                    .filter((t) => t.completed && t.type === 'spending')
                    .reduce((sum, t) => sum + t.amount, 0);
                return Math.max(0, earned - spent + state.manualAdjustment);
            },

            getTasksByChild: (childId) => {
                const state = get();
                return state.tasks.filter((t) => t.childId === childId);
            },

            getTasksByChildAndType: (childId, type) => {
                const state = get();
                return state.tasks.filter((t) => t.childId === childId && t.type === type);
            },

            refreshDailyTasks: () => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => {
                    const updatedTasks = [...state.tasks];
                    const recurringTemplates = state.tasks.filter((t) => t.recurring === 'daily' && !t.isRecurringInstance);

                    recurringTemplates.forEach((template) => {
                        // Check if today's instance already exists
                        const todayInstance = updatedTasks.find(
                            (t) =>
                                t.id.startsWith(template.id + '_') &&
                                t.date === today &&
                                t.isRecurringInstance
                        );

                        // If no instance for today, create one
                        if (!todayInstance) {
                            updatedTasks.push({
                                ...template,
                                id: `${template.id}_${today}`,
                                completed: false,
                                completedDate: undefined,
                                date: today,
                                isRecurringInstance: true,
                            });
                        }
                    });

                    return { tasks: updatedTasks };
                });
            },

            setManualAdjustment: (amount) => set({ manualAdjustment: amount }),

            adjustBalance: (delta) => 
                set((state) => ({
                    manualAdjustment: state.manualAdjustment + delta,
                })),
        }),
        {
            name: 'task-store',
        }
    )
);