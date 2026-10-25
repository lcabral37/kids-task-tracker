import type React from "react";

const ProgressBar: React.FC<{ done: number; total: number; color: string }> = ({
	done,
	total,
	color,
}) => (
	<div
		className="h-3 w-full overflow-hidden rounded-full bg-white/70"
		role="progressbar"
		aria-valuemin={0}
		aria-valuemax={total}
		aria-valuenow={done}
	>
		<div
			className={`h-full rounded-full transition-all duration-500 ${color}`}
			style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
		/>
	</div>
);

export default ProgressBar;
