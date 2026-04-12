import create from 'zustand';
import { persist } from 'zustand/middleware';
export const useTaskStore = create()(persist((set, get) => ({
    children: [],
    tasks: [],
    activeChildId: null,
    manualAdjustment: 0,
    addChild: (child) => set((state) => ({
        children: [...state.children, child],
        activeChildId: state.activeChildId || child.id,
    })),
    removeChild: (id) => set((state) => ({
        children: state.children.filter((c) => c.id !== id),
        activeChildId: state.activeChildId === id ? null : state.activeChildId,
    })),
    addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task],
    })),
    removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
    })),
    completeTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) => task.id === id
            ? { ...task, completed: true, completedDate: new Date().toISOString().split('T')[0] }
            : task),
    })),
    toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) => task.id === id
            ? {
                ...task,
                completed: !task.completed,
                completedDate: !task.completed ? new Date().toISOString().split('T')[0] : undefined,
            }
            : task),
    })),
    updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) => task.id === id ? { ...task, ...updates } : task),
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
                const todayInstance = updatedTasks.find((t) => t.id.startsWith(template.id + '_') &&
                    t.date === today &&
                    t.isRecurringInstance);
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
    adjustBalance: (delta) => set((state) => ({
        manualAdjustment: state.manualAdjustment + delta,
    })),
}), {
    name: 'task-store',
}));
