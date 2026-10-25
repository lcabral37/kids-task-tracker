import { useLiveQuery } from "dexie-react-hooks";
import { Pencil, Trash2, Wallet } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { loadChildDay, payOut, removeChild } from "../db/actions";
import db from "../db/database";
import { formatDay, formatMoney } from "../lib/format";
import { colorOf } from "../lib/theme";
import AddTaskForm from "./AddTaskForm";
import ProgressBar from "./ProgressBar";
import TaskItem from "./TaskItem";

const ChildPage: React.FC<{ childId: string; today: string }> = ({
	childId,
	today,
}) => {
	const child = useLiveQuery(
		async () => (await db.children.get(childId)) ?? null,
		[childId],
	);
	const day = useLiveQuery(
		() => loadChildDay(childId, today),
		[childId, today],
	);
	const [editing, setEditing] = useState(false);
	const hasNoTasks = day?.tasks.length === 0;

	// Start in edit mode for a child without tasks, so the form stays open while adding several.
	useEffect(() => {
		if (hasNoTasks) setEditing(true);
	}, [hasNoTasks]);

	if (child === undefined || !day) return null;
	if (child === null) {
		return (
			<p className="text-center text-slate-600">
				This child isn't here any more.{" "}
				<a href="#/" className="font-semibold text-blue-600 underline">
					Back to the list
				</a>
			</p>
		);
	}

	const color = colorOf(child.color);
	const done = day.tasks.filter((t) => t.done).length;
	const total = day.tasks.length;

	const handlePayOut = () => {
		if (confirm(`Pay out ${formatMoney(day.balance)} to ${child.name}?`)) {
			payOut(child.id, day.balance, today);
		}
	};

	const handleRemoveChild = async () => {
		if (
			confirm(
				`Remove ${child.name} and all their tasks and earnings? This can't be undone.`,
			)
		) {
			await removeChild(child.id);
			location.hash = "#/";
		}
	};

	return (
		<div className="space-y-6">
			<section className={`rounded-3xl p-5 shadow-sm ${color.soft}`}>
				<div className="flex items-center gap-4">
					<span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-5xl shadow-inner">
						{child.avatar}
					</span>
					<div className="min-w-0">
						<h2 className="truncate text-3xl font-bold">{child.name}</h2>
						<p className="text-slate-600">{formatDay(today)}</p>
					</div>
				</div>
				{total > 0 && (
					<div className="mt-5">
						<div className="mb-1 flex justify-between text-sm font-medium text-slate-600">
							<span>
								{done === total
									? "All done today! 🎉"
									: `${done} of ${total} done`}
							</span>
							<span>+{formatMoney(day.earnedToday)} today</span>
						</div>
						<ProgressBar done={done} total={total} color={color.strong} />
					</div>
				)}
				<div className="mt-5 flex items-center justify-between rounded-2xl bg-white/70 p-4">
					<div>
						<p className="text-sm text-slate-500">Saved up</p>
						<p className="text-2xl font-bold">{formatMoney(day.balance)}</p>
					</div>
					<button
						type="button"
						onClick={handlePayOut}
						disabled={day.balance <= 0}
						className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 font-semibold text-amber-950 hover:bg-amber-500 disabled:opacity-40"
					>
						<Wallet aria-hidden size={20} /> Pay out
					</button>
				</div>
			</section>

			<section>
				<div className="mb-3 flex items-center justify-between">
					<h3 className="text-xl font-bold">Today's tasks</h3>
					<button
						type="button"
						onClick={() => setEditing(!editing)}
						aria-pressed={editing}
						className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200"
					>
						<Pencil aria-hidden size={16} /> {editing ? "Done" : "Edit"}
					</button>
				</div>
				{total === 0 ? (
					<p className="rounded-2xl bg-white p-5 text-center text-slate-500 shadow-sm">
						No tasks yet. Add one below.
					</p>
				) : (
					<ul className="space-y-3">
						{day.tasks.map((task) => (
							<TaskItem
								key={task.id}
								task={task}
								today={today}
								editing={editing}
								color={color.strong}
							/>
						))}
					</ul>
				)}
			</section>

			{editing && <AddTaskForm childId={child.id} />}

			{editing && (
				<button
					type="button"
					onClick={handleRemoveChild}
					className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 py-3 font-semibold text-red-600 hover:bg-red-50"
				>
					<Trash2 aria-hidden size={20} /> Remove {child.name}
				</button>
			)}
		</div>
	);
};

export default ChildPage;
