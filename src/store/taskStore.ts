import { create } from "zustand";

export interface Child {
	id: string;
	name: string;
}

export interface Task {
	id: string;
	title: string;
	completed: boolean;
}

interface TaskStore {
	children: Child[];
	tasks: Task[];
	dailyEarnings: number;
	addChild: (name: string) => void;
	removeChild: (id: string) => void;
	addTask: (task: Task) => void;
	toggleTask: (id: string) => void;
	setDailyEarnings: (amount: number) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
	children: [],
	tasks: [],
	dailyEarnings: 0,
	addChild: (name) =>
		set((state) => ({
			children: [...state.children, { id: crypto.randomUUID(), name }],
		})),
	removeChild: (id) =>
		set((state) => ({
			children: state.children.filter((child) => child.id !== id),
		})),
	addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
	toggleTask: (id) =>
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === id ? { ...task, completed: !task.completed } : task,
			),
		})),
	setDailyEarnings: (amount) => set({ dailyEarnings: amount }),
}));
