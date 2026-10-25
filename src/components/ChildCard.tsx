import { useLiveQuery } from "dexie-react-hooks";
import type React from "react";
import { loadChildDay } from "../db/actions";
import type { Child } from "../db/database";
import { formatMoney } from "../lib/format";
import { colorOf } from "../lib/theme";
import ProgressBar from "./ProgressBar";

const ChildCard: React.FC<{ child: Child; today: string }> = ({
	child,
	today,
}) => {
	const day = useLiveQuery(
		() => loadChildDay(child.id, today),
		[child.id, today],
	);
	const color = colorOf(child.color);
	const done = day?.tasks.filter((t) => t.done).length ?? 0;
	const total = day?.tasks.length ?? 0;

	return (
		<a
			href={`#/child/${child.id}`}
			className={`block rounded-3xl p-5 shadow-sm transition active:scale-[0.98] ${color.soft}`}
		>
			<div className="flex items-center gap-4">
				<span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-4xl shadow-inner">
					{child.avatar}
				</span>
				<div className="min-w-0 flex-1">
					<h2 className="truncate text-2xl font-bold">{child.name}</h2>
					<p className="text-slate-600">
						{total === 0
							? "No tasks yet"
							: done === total
								? "All done today! 🎉"
								: `${done} of ${total} done today`}
					</p>
				</div>
			</div>
			{total > 0 && (
				<div className="mt-4">
					<ProgressBar done={done} total={total} color={color.strong} />
				</div>
			)}
			<dl className="mt-4 flex justify-between text-sm">
				<div>
					<dt className="text-slate-500">Today</dt>
					<dd className="text-lg font-semibold">
						{formatMoney(day?.earnedToday ?? 0)}
					</dd>
				</div>
				<div className="text-right">
					<dt className="text-slate-500">Saved up</dt>
					<dd className="text-lg font-semibold">
						{formatMoney(day?.balance ?? 0)}
					</dd>
				</div>
			</dl>
		</a>
	);
};

export default ChildCard;
