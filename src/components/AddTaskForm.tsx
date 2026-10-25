import { Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { addTask } from "../db/actions";
import type { Repeat } from "../db/database";
import { CURRENCY, parseMoney } from "../lib/format";

const inputClass =
	"mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

const AddTaskForm: React.FC<{ childId: string }> = ({ childId }) => {
	const [title, setTitle] = useState("");
	const [reward, setReward] = useState("");
	const [repeat, setRepeat] = useState<Repeat>("daily");
	const amount = parseMoney(reward);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || amount === null) return;
		setTitle("");
		setReward("");
		await addTask({ childId, title: title.trim(), reward: amount, repeat });
	};

	return (
		<form
			onSubmit={submit}
			className="space-y-4 rounded-3xl bg-white p-5 shadow-sm"
		>
			<h3 className="text-lg font-bold">New task</h3>
			<label className="block">
				<span className="text-sm font-medium text-slate-600">
					What needs doing?
				</span>
				<input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Make the bed"
					required
					maxLength={60}
					className={inputClass}
				/>
			</label>
			<div className="flex gap-3">
				<label className="block flex-1">
					<span className="text-sm font-medium text-slate-600">
						Reward ({CURRENCY})
					</span>
					<input
						value={reward}
						onChange={(e) => setReward(e.target.value)}
						inputMode="decimal"
						placeholder="10"
						required
						aria-invalid={reward !== "" && amount === null}
						className={inputClass}
					/>
				</label>
				<label className="block flex-1">
					<span className="text-sm font-medium text-slate-600">How often</span>
					<select
						value={repeat}
						onChange={(e) => setRepeat(e.target.value as Repeat)}
						className={`${inputClass} bg-white`}
					>
						<option value="daily">Every day</option>
						<option value="once">Just once</option>
					</select>
				</label>
			</div>
			<button
				type="submit"
				disabled={!title.trim() || amount === null}
				className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
			>
				<Plus aria-hidden /> Add task
			</button>
		</form>
	);
};

export default AddTaskForm;
