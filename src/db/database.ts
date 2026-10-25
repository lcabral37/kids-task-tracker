import Dexie, { type Table } from "dexie";

export interface Child {
	id: string;
	name: string;
	avatar: string;
	color: string;
	createdAt: number;
}

export type Repeat = "daily" | "once";

export interface Task {
	id: string;
	childId: string;
	title: string;
	// Money is stored in minor units (øre/cents) so sums stay exact.
	reward: number;
	repeat: Repeat;
	createdAt: number;
}

export interface Completion {
	id: string;
	taskId: string;
	childId: string;
	date: string;
	// Copied from the task when it's ticked, so changing or deleting the task later doesn't
	// rewrite what was already earned.
	reward: number;
}

export interface Payout {
	id: string;
	childId: string;
	amount: number;
	date: string;
}

export interface SyncQueue {
	id?: number;
	entity: string;
	action: string;
	payload: object;
}

class KidsTaskTrackerDB extends Dexie {
	children!: Table<Child, string>;
	tasks!: Table<Task, string>;
	completions!: Table<Completion, string>;
	payouts!: Table<Payout, string>;
	syncQueue!: Table<SyncQueue, number>;

	constructor() {
		super("KidsTaskTrackerDB");
		this.version(1).stores({
			children: "++id",
			tasks: "++id,childId",
			dailyEarnings: "++id",
			syncQueue: "++id",
		});
		// IndexedDB can't change a table's primary key, so version 2 drops the auto-increment
		// tables and version 3 recreates them with string ids (safe to merge across devices later).
		this.version(2).stores({
			children: null,
			tasks: null,
			dailyEarnings: null,
		});
		this.version(3).stores({
			children: "id",
			tasks: "id, childId",
			completions: "id, childId, taskId, [taskId+date]",
			payouts: "id, childId",
		});
	}
}

const db = new KidsTaskTrackerDB();

export default db;
