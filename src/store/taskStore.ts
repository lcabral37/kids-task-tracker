import create from 'zustand';
import { persist } from 'zustand/middleware';

const STORE_VERSION = 2;

// Migration helper
const migrateData = (data: any) => {
    const version = data.version || 1;
    
    if (version < STORE_VERSION) {
        console.log(`Migrating from v${version} to v${STORE_VERSION}`);
        
        if (version === 1) {
            // v1 -> v2: Convert from boolean completed to numeric completionCount
            if (data.tasks) {
                data.tasks = data.tasks.map((task: any) => ({
                    ...task,
                    completionCount: task.completed ? 1 : 0,
                    completed: undefined,
                    completedDate: undefined,
                }));
            }
        }
        
        data.version = STORE_VERSION;
    }
    
    return data;
};

export interface Task {
    id: string;
    title: string;
    description?: string;
    amount: number;
    completionCount: number;
    childId: string;
    date: string;
    type: 'earning' | 'spending';
    icon?: string;
    templateId?: string;
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
    version: number;
    addChild: (child: Child) => void;
    removeChild: (id: string) => void;
    addTask: (task: Task) => void;
    completeTask: (id: string) => void;
    toggleTask: (id: string) => void;
    decrementTask: (id: string) => void;
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
    resetStore: () => void;
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            children: [],
            tasks: [],
            activeChildId: null,
            manualAdjustment: 0,
            version: STORE_VERSION,

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
                            ? { ...task, completionCount: task.completionCount + 1 }
                            : task
                    ),
                })),

            toggleTask: (id: string) =>
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id
                            ? {
                                ...task,
                                completionCount: task.completionCount + 1,
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

            decrementTask: (id: string) =>
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === id && task.completionCount > 0
                            ? { ...task, completionCount: task.completionCount - 1 }
                            : task
                    ),
                })),

            setActiveChild: (id) => set({ activeChildId: id }),

            getDailyEarnings: (date) => {
                const state = get();
                return state.tasks
                    .filter((t) => t.date === date && t.type === 'earning')
                    .reduce((sum, t) => sum + t.amount * t.completionCount, 0);
            },

            getTotalEarnings: () => {
                const state = get();
                return state.tasks
                    .filter((t) => t.type === 'earning' && t.date !== 'template')
                    .reduce((sum, t) => sum + t.amount * t.completionCount, 0);
            },

            getSpentToday: (date) => {
                const state = get();
                return state.tasks
                    .filter((t) => t.date === date && t.type === 'spending' && t.date !== 'template')
                    .reduce((sum, t) => sum + t.amount * t.completionCount, 0);
            },

            getAvailableBalance: () => {
                const state = get();
                const earned = state.tasks
                    .filter((t) => t.type === 'earning' && t.date !== 'template')
                    .reduce((sum, t) => sum + t.amount * t.completionCount, 0);
                const spent = state.tasks
                    .filter((t) => t.type === 'spending' && t.date !== 'template')
                    .reduce((sum, t) => sum + t.amount * t.completionCount, 0);
                return earned - spent + state.manualAdjustment;
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
                    // Get all template tasks (those with date === "template")
                    const templates = state.tasks.filter((t) => t.date === 'template');

                    templates.forEach((template) => {
                        // Check if today's instance already exists
                        const todayInstance = updatedTasks.find(
                            (t) => t.templateId === template.id && t.date === today
                        );

                        // If no instance for today, create one with completionCount reset to 0
                        if (!todayInstance) {
                            updatedTasks.push({
                                ...template,
                                id: `${template.id}_${today}`,
                                completionCount: 0,
                                date: today,
                                templateId: template.id,
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

            resetStore: () => {
                set({
                    children: [],
                    tasks: [],
                    activeChildId: null,
                    manualAdjustment: 0,
                    version: STORE_VERSION,
                });
            },
        }),
        {
            name: 'task-store',
            merge: (persistedState, currentState) => {
                const migrated = migrateData(persistedState);
                return { ...currentState, ...migrated };
            },
        }
    )
);