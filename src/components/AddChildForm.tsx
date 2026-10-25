import { Plus, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { addChild } from "../db/actions";
import { AVATARS, COLOR_NAMES } from "../lib/theme";

const AddChildForm: React.FC<{ childCount: number; startOpen?: boolean }> = ({
	childCount,
	startOpen = false,
}) => {
	const [open, setOpen] = useState(startOpen);
	const [name, setName] = useState("");
	const [avatar, setAvatar] = useState(AVATARS[childCount % AVATARS.length]);

	if (!open) {
		return (
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 p-5 text-lg font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700"
			>
				<Plus aria-hidden /> Add a child
			</button>
		);
	}

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) return;
		await addChild({
			name: trimmed,
			avatar,
			color: COLOR_NAMES[childCount % COLOR_NAMES.length],
		});
		setName("");
		setAvatar(AVATARS[(childCount + 1) % AVATARS.length]);
		setOpen(false);
	};

	return (
		<form
			onSubmit={submit}
			className="space-y-4 rounded-3xl bg-white p-5 shadow-sm"
		>
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold">Add a child</h2>
				{!startOpen && (
					<button
						type="button"
						onClick={() => setOpen(false)}
						className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
						aria-label="Cancel"
					>
						<X aria-hidden />
					</button>
				)}
			</div>
			<label className="block">
				<span className="text-sm font-medium text-slate-600">Name</span>
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					maxLength={40}
					autoFocus
					className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
				/>
			</label>
			<fieldset>
				<legend className="text-sm font-medium text-slate-600">Picture</legend>
				<div className="mt-2 flex flex-wrap gap-2">
					{AVATARS.map((a) => (
						<button
							key={a}
							type="button"
							onClick={() => setAvatar(a)}
							aria-pressed={a === avatar}
							className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
								a === avatar
									? "bg-blue-100 ring-2 ring-blue-500"
									: "bg-slate-100"
							}`}
						>
							{a}
						</button>
					))}
				</div>
			</fieldset>
			<button
				type="submit"
				className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white hover:bg-blue-700"
			>
				Add
			</button>
		</form>
	);
};

export default AddChildForm;
