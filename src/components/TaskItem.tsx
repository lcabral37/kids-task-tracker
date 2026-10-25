import { Check, Trash2 } from "lucide-react";
import type React from "react";
import { removeTask, type TaskView, toggleTask } from "../db/actions";
import { formatMoney } from "../lib/format";

const TaskItem: React.FC<{
	task: TaskView;
	today: string;
	editing: boolean;
	color: string;
}> = ({ task, today, editing, color }) => (
	<li className="flex items-center gap-2">
		<button
			type="button"
			role="checkbox"
			aria-checked={task.done}
			onClick={() => toggleTask(task, today)}
			className={`flex min-w-0 flex-1 items-center gap-4 rounded-2xl p-4 text-left shadow-sm transition active:scale-[0.98] ${
				task.done ? "bg-white/60" : "bg-white"
			}`}
		>
			<span
				className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 transition ${
					task.done
						? `${color} border-transparent text-white`
						: "border-slate-300"
				}`}
			>
				{task.done && <Check strokeWidth={4} aria-hidden />}
			</span>
			<span className="min-w-0 flex-1">
				<span
					className={`block truncate text-lg font-semibold ${task.done ? "text-slate-400 line-through" : ""}`}
				>
					{task.title}
				</span>
				<span className="text-sm text-slate-500">
					{task.repeat === "daily" ? "Every day" : "Just once"}
				</span>
			</span>
			<span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-800">
				+{formatMoney(task.reward)}
			</span>
		</button>
		{editing && (
			<button
				type="button"
				onClick={() => {
					if (confirm(`Delete "${task.title}"? Money already earned is kept.`))
						removeTask(task.id);
				}}
				className="rounded-full p-3 text-red-600 hover:bg-red-50"
				aria-label={`Delete ${task.title}`}
			>
				<Trash2 aria-hidden />
			</button>
		)}
	</li>
);

export default TaskItem;
