import { useLiveQuery } from "dexie-react-hooks";
import type React from "react";
import db from "../db/database";
import AddChildForm from "./AddChildForm";
import ChildCard from "./ChildCard";

const Home: React.FC<{ today: string }> = ({ today }) => {
	const children = useLiveQuery(() =>
		db.children.toCollection().sortBy("createdAt"),
	);

	if (!children) return null;

	if (children.length === 0) {
		return (
			<div className="space-y-6">
				<div className="text-center">
					<p className="text-6xl" aria-hidden>
						👋
					</p>
					<h2 className="mt-2 text-2xl font-bold">Welcome!</h2>
					<p className="mt-1 text-slate-600">
						Add your children, give them tasks, and watch their pocket money
						grow.
					</p>
				</div>
				<AddChildForm childCount={0} startOpen />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{children.map((child) => (
				<ChildCard key={child.id} child={child} today={today} />
			))}
			<AddChildForm childCount={children.length} />
		</div>
	);
};

export default Home;
