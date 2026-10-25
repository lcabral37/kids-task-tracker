// One currency for the whole app; change it here.
export const CURRENCY = "NOK";

const money = new Intl.NumberFormat(undefined, {
	style: "currency",
	currency: CURRENCY,
});

export function formatMoney(minorUnits: number): string {
	return money.format(minorUnits / 100);
}

// Accepts "10", "10.5" and "10,50"; returns minor units, or null for anything else.
export function parseMoney(input: string): number | null {
	const value = Number(input.trim().replace(",", "."));
	if (input.trim() === "" || !Number.isFinite(value) || value < 0) return null;
	return Math.round(value * 100);
}

// The local calendar day, not UTC: a task ticked at 00:30 belongs to that morning.
export function localDate(d = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDay(date: string): string {
	return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
		weekday: "long",
		day: "numeric",
		month: "long",
	});
}
