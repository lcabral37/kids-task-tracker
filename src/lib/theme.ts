export const AVATARS = [
	"🦊",
	"🐼",
	"🦁",
	"🐸",
	"🐵",
	"🦄",
	"🐯",
	"🐨",
	"🐙",
	"🐧",
];

// Full class names, so Tailwind finds them when it scans the source.
export const COLORS: Record<
	string,
	{ soft: string; strong: string; ring: string }
> = {
	blue: { soft: "bg-blue-100", strong: "bg-blue-500", ring: "ring-blue-300" },
	pink: { soft: "bg-pink-100", strong: "bg-pink-500", ring: "ring-pink-300" },
	green: {
		soft: "bg-emerald-100",
		strong: "bg-emerald-500",
		ring: "ring-emerald-300",
	},
	orange: {
		soft: "bg-orange-100",
		strong: "bg-orange-500",
		ring: "ring-orange-300",
	},
	purple: {
		soft: "bg-violet-100",
		strong: "bg-violet-500",
		ring: "ring-violet-300",
	},
	teal: { soft: "bg-teal-100", strong: "bg-teal-500", ring: "ring-teal-300" },
};

export const COLOR_NAMES = Object.keys(COLORS);

export function colorOf(name: string) {
	return COLORS[name] ?? COLORS.blue;
}
