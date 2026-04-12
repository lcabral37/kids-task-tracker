import create from 'zustand';
import { persist } from 'zustand/middleware';

const STORE_VERSION = 3;

// Task/Activity Template - shared across all children
export interface TaskTemplate {
    id: string;
    title: string;
    description?: string;
    amount: number;
    type: 'earning' | 'spending';
    icon?: string;
    order: number; // Display order (0-indexed)
}

// Occurrence/Completion record - tracks per-child per-day activity
export interface TaskOccurrence {
    id: string;
    templateId: string;
    childId: string;
    date: string;
    completionCount: number;
}

// Child with per-child balance and PIN protection
export interface Child {
    id: string;
    name: string;
    age: number;
    manualAdjustment: number; // Per-child manual adjustment
    pin?: string; // 4-6 digit PIN for protection (optional)
}

interface TaskStore {
    // Data
    children: Child[];
    taskTemplates: TaskTemplate[];
    occurrences: TaskOccurrence[];
    activeChildId: string | null;
    version: number;

    // Child management
    addChild: (child: Omit<Child, 'manualAdjustment'>) => void;
    removeChild: (id: string) => void;
    setActiveChild: (id: string) => void;
    updateChild: (id: string, updates: Partial<Child>) => void;
    updateChildBalance: (childId: string, delta: number) => void;
    transferBalance: (fromChildId: string, toChildId: string, amount: number) => void;

    // Task templates (independent of child)
    addTaskTemplate: (template: TaskTemplate) => void;
    removeTaskTemplate: (id: string) => void;
    updateTaskTemplate: (id: string, updates: Partial<TaskTemplate>) => void;
    getTaskTemplates: (type: 'earning' | 'spending') => TaskTemplate[];
    reorderTemplates: (type: 'earning' | 'spending', orderedIds: string[]) => void;

    // Occurrences (per-child per-day tracking)
    getOccurrencesForDate: (childId: string, date: string) => TaskOccurrence[];
    incrementOccurrence: (templateId: string, childId: string, date: string) => void;
    decrementOccurrence: (templateId: string, childId: string, date: string) => void;
    removeOccurrence: (occurenceId: string) => void;
    refreshDailyTasks: () => void;

    // Calculations per-child
    getChildBalance: (childId: string) => number;
    getChildDailyEarnings: (childId: string, date: string) => number;
    getChildDailySpending: (childId: string, date: string) => number;
    getChildTotalEarnings: (childId: string) => number;
    getChildTotalSpending: (childId: string) => number;

    // Reset
    resetStore: () => void;
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set, get) => ({
            children: [],
            taskTemplates: [],
            occurrences: [],
            activeChildId: null,
            version: STORE_VERSION,

            // Child management
            addChild: (child) =>
                set((state) => ({
                    children: [...state.children, { ...child, manualAdjustment: 0 }],
                    activeChildId: state.activeChildId || child.id,
                })),

            removeChild: (id) =>
                set((state) => ({
                    children: state.children.filter((c) => c.id !== id),
                    occurrences: state.occurrences.filter((o) => o.childId !== id),
                    activeChildId: state.activeChildId === id ? null : state.activeChildId,
                })),

            setActiveChild: (id) => set({ activeChildId: id }),

            updateChild: (id, updates) =>
                set((state) => ({
                    children: state.children.map((child) =>
                        child.id === id ? { ...child, ...updates } : child
                    ),
                })),

            updateChildBalance: (childId, delta) =>
                set((state) => ({
                    children: state.children.map((child) =>
                        child.id === childId
                            ? { ...child, manualAdjustment: child.manualAdjustment + delta }
                            : child
                    ),
                })),

            transferBalance: (fromChildId, toChildId, amount) => {
                set((state) => {
                    const fromChild = state.children.find((c) => c.id === fromChildId);
                    const toChild = state.children.find((c) => c.id === toChildId);

                    if (!fromChild || !toChild) return state;

                    const fromBalance = get().getChildBalance(fromChildId);
                    if (fromBalance < amount) {
                        console.warn(`Cannot transfer ${amount}: ${fromChild.name} only has ${fromBalance}`);
                        return state;
                    }

                    return {
                        children: state.children.map((child) => {
                            if (child.id === fromChildId) {
                                return { ...child, manualAdjustment: child.manualAdjustment - amount };
                            }
                            if (child.id === toChildId) {
                                return { ...child, manualAdjustment: child.manualAdjustment + amount };
                            }
                            return child;
                        }),
                    };
                });
            },

            // Task templates
            addTaskTemplate: (template) =>
                set((state) => {
                    const templates = state.taskTemplates.filter((t) => t.type === template.type);
                    return {
                        taskTemplates: [...state.taskTemplates, { ...template, order: templates.length }],
                    };
                }),

            removeTaskTemplate: (id) =>
                set((state) => {
                    const removed = state.taskTemplates.find((t) => t.id === id);
                    if (!removed) return state;
                    return {
                        taskTemplates: state.taskTemplates
                            .filter((t) => t.id !== id)
                            .map((t) =>
                                t.type === removed.type && t.order > removed.order
                                    ? { ...t, order: t.order - 1 }
                                    : t
                            ),
                        occurrences: state.occurrences.filter((o) => o.templateId !== id),
                    };
                }),

            updateTaskTemplate: (id, updates) =>
                set((state) => ({
                    taskTemplates: state.taskTemplates.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                })),

            getTaskTemplates: (type) => {
                const state = get();
                return state.taskTemplates.filter((t) => t.type === type).sort((a, b) => a.order - b.order);
            },

            reorderTemplates: (type, orderedIds) => {
                set((state) => ({
                    taskTemplates: state.taskTemplates.map((t) => {
                        if (t.type === type) {
                            const newOrder = orderedIds.indexOf(t.id);
                            return { ...t, order: newOrder };
                        }
                        return t;
                    }),
                }));
            },

            // Occurrences
            getOccurrencesForDate: (childId, date) => {
                const state = get();
                return state.occurrences.filter((o) => o.childId === childId && o.date === date);
            },

            incrementOccurrence: (templateId, childId, date) => {
                set((state) => {
                    const existing = state.occurrences.find(
                        (o) => o.templateId === templateId && o.childId === childId && o.date === date
                    );

                    if (existing) {
                        return {
                            occurrences: state.occurrences.map((o) =>
                                o.id === existing.id
                                    ? { ...o, completionCount: o.completionCount + 1 }
                                    : o
                            ),
                        };
                    } else {
                        return {
                            occurrences: [
                                ...state.occurrences,
                                {
                                    id: `${templateId}_${childId}_${date}_${Date.now()}`,
                                    templateId,
                                    childId,
                                    date,
                                    completionCount: 1,
                                },
                            ],
                        };
                    }
                });
            },

            decrementOccurrence: (templateId, childId, date) => {
                set((state) => {
                    const existing = state.occurrences.find(
                        (o) => o.templateId === templateId && o.childId === childId && o.date === date
                    );

                    if (existing && existing.completionCount > 0) {
                        return {
                            occurrences: state.occurrences.map((o) =>
                                o.id === existing.id
                                    ? { ...o, completionCount: o.completionCount - 1 }
                                    : o
                            ),
                        };
                    }
                    return state;
                });
            },

            removeOccurrence: (occurrenceId) =>
                set((state) => ({
                    occurrences: state.occurrences.filter((o) => o.id !== occurrenceId),
                })),

            refreshDailyTasks: () => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => {
                    // For each child and each template, ensure an occurrence exists for today
                    let updatedOccurrences = [...state.occurrences];

                    state.children.forEach((child) => {
                        state.taskTemplates.forEach((template) => {
                            const exists = updatedOccurrences.find(
                                (o) => o.templateId === template.id && o.childId === child.id && o.date === today
                            );

                            if (!exists) {
                                updatedOccurrences.push({
                                    id: `${template.id}_${child.id}_${today}_${Date.now()}`,
                                    templateId: template.id,
                                    childId: child.id,
                                    date: today,
                                    completionCount: 0,
                                });
                            }
                        });
                    });

                    return { occurrences: updatedOccurrences };
                });
            },

            // Per-child calculations
            getChildBalance: (childId) => {
                const state = get();
                const earned = state.occurrences
                    .filter((o) => o.childId === childId)
                    .reduce((sum, o) => {
                        const template = state.taskTemplates.find((t) => t.id === o.templateId);
                        return template && template.type === 'earning'
                            ? sum + template.amount * o.completionCount
                            : sum;
                    }, 0);

                const spent = state.occurrences
                    .filter((o) => o.childId === childId)
                    .reduce((sum, o) => {
                        const template = state.taskTemplates.find((t) => t.id === o.templateId);
                        return template && template.type === 'spending'
                            ? sum + template.amount * o.completionCount
                            : sum;
                    }, 0);

                const child = state.children.find((c) => c.id === childId);
                return earned - spent + (child?.manualAdjustment || 0);
            },

            getChildDailyEarnings: (childId, date) => {
                const state = get();
                return state.occurrences
                    .filter((o) => o.childId === childId && o.date === date)
                    .reduce((sum, o) => {
                        const template = state.taskTemplates.find((t) => t.id === o.templateId);
                        return template && template.type === 'earning'
                            ? sum + template.amount * o.completionCount
                            : sum;
                    }, 0);
            },

            getChildDailySpending: (childId, date) => {
                const state = get();
                return state.occurrences
                    .filter((o) => o.childId === childId && o.date === date)
                    .reduce((sum, o) => {
                        const template = state.taskTemplates.find((t) => t.id === o.templateId);
                        return template && template.type === 'spending'
                            ? sum + template.amount * o.completionCount
                            : sum;
                    }, 0);
            },

            getChildTotalEarnings: (childId) => {
                const state = get();
                return state.occurrences
                    .filter((o) => o.childId === childId)
                    .reduce((sum, o) => {
                        const template = state.taskTemplates.find((t) => t.id === o.templateId);
                        return template && template.type === 'earning'
                            ? sum + template.amount * o.completionCount
                            : sum;
                    }, 0);
            },

            getChildTotalSpending: (childId) => {
                const state = get();
                return state.occurrences
                    .filter((o) => o.childId === childId)
                    .reduce((sum, o) => {
                        const template = state.taskTemplates.find((t) => t.id === o.templateId);
                        return template && template.type === 'spending'
                            ? sum + template.amount * o.completionCount
                            : sum;
                    }, 0);
            },

            resetStore: () => {
                set({
                    children: [],
                    taskTemplates: [],
                    occurrences: [],
                    activeChildId: null,
                    version: STORE_VERSION,
                });
            },
        }),
        {
            name: 'task-store',
            merge: (persistedState: any, currentState) => {
                // Version 3 is a complete rewrite - don't migrate, start fresh
                if (persistedState.version < STORE_VERSION) {
                    console.log('Version 3: Starting fresh with new data model');
                    return currentState;
                }
                return { ...currentState, ...persistedState };
            },
        }
    )
);
