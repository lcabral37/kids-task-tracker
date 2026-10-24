import React from "react";
import type { Child } from "../store/taskStore";

const ChildList: React.FC = () => {
	const [children, setChildren] = React.useState<Child[]>([]);

	const addChild = () => {
		const name = prompt("Enter child name:")?.trim();
		if (!name) return;
		setChildren([...children, { id: crypto.randomUUID(), name }]);
	};

	const removeChild = (id: string) => {
		setChildren(children.filter((c) => c.id !== id));
	};

	return (
		<div>
			<h1>Child Profiles</h1>
			<ul>
				{children.map((child) => (
					<li key={child.id}>
						{child.name}{" "}
						<button type="button" onClick={() => removeChild(child.id)}>
							Remove
						</button>
					</li>
				))}
			</ul>
			<button type="button" onClick={addChild}>
				Add Child
			</button>
		</div>
	);
};

export default ChildList;
