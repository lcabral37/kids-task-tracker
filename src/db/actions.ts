import db, { type Child, type Repeat, type Task } from "./database";

// crypto.randomUUID only exists on HTTPS and localhost; getRandomValues also works when testing
// on a phone over the LAN.
export function newId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function addChild(
	child: Pick<Child, "name" | "avatar" | "color">,
) {
	// Ask the browser not to evict the data when storage runs low; it's the only copy.
	navigator.storage?.persist?.();
	await db.children.add({ ...child, id: newId(), createdAt: Date.now() });
}

export async function removeChild(childId: string) {
	await db.transaction(
		"rw",
		[db.children, db.tasks, db.completions, db.payouts],
		async () => {
			await db.tasks.where("childId").equals(childId).delete();
			await db.completions.where("childId").equals(childId).delete();
			await db.payouts.where("childId").equals(childId).delete();
			await db.children.delete(childId);
		},
	);
}

export async function addTask(task: {
	childId: string;
	title: string;
	reward: number;
	repeat: Repeat;
}) {
	await db.tasks.add({ ...task, id: newId(), createdAt: Date.now() });
}

export async function removeTask(taskId: string) {
	await db.tasks.delete(taskId);
}

export async function toggleTask(task: Task, date: string) {
	await db.transaction("rw", db.completions, async () => {
		const existing =
			task.repeat === "daily"
				? await db.completions
						.where("[taskId+date]")
						.equals([task.id, date])
						.first()
				: await db.completions.where("taskId").equals(task.id).first();
		if (existing) {
			await db.completions.delete(existing.id);
		} else {
			await db.completions.add({
				id: newId(),
				taskId: task.id,
				childId: task.childId,
				date,
				reward: task.reward,
			});
		}
	});
}

export async function payOut(childId: string, amount: number, date: string) {
	await db.payouts.add({ id: newId(), childId, amount, date });
}

export interface TaskView extends Task {
	done: boolean;
}

export interface ChildDay {
	tasks: TaskView[];
	earnedToday: number;
	balance: number;
}

export async function loadChildDay(
	childId: string,
	date: string,
): Promise<ChildDay> {
	const [tasks, completions, payouts] = await Promise.all([
		db.tasks.where("childId").equals(childId).sortBy("createdAt"),
		db.completions.where("childId").equals(childId).toArray(),
		db.payouts.where("childId").equals(childId).toArray(),
	]);
	const doneToday = new Set(
		completions.filter((c) => c.date === date).map((c) => c.taskId),
	);
	const doneEver = new Set(completions.map((c) => c.taskId));
	const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

	return {
		// A one-off task disappears the day after it's done.
		tasks: tasks
			.filter(
				(t) =>
					t.repeat === "daily" || !doneEver.has(t.id) || doneToday.has(t.id),
			)
			.map((t) => ({ ...t, done: doneToday.has(t.id) })),
		earnedToday: sum(
			completions.filter((c) => c.date === date).map((c) => c.reward),
		),
		balance:
			sum(completions.map((c) => c.reward)) - sum(payouts.map((p) => p.amount)),
	};
}
