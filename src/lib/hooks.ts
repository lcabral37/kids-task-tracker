import { useEffect, useState } from "react";
import { localDate } from "./format";

// Rolls over at midnight, and when the app comes back from the background on a new day.
export function useToday(): string {
	const [today, setToday] = useState(localDate);
	useEffect(() => {
		const update = () => setToday(localDate());
		const timer = setInterval(update, 60_000);
		document.addEventListener("visibilitychange", update);
		return () => {
			clearInterval(timer);
			document.removeEventListener("visibilitychange", update);
		};
	}, []);
	return today;
}

// Hash routes (#/child/<id>) so the phone's back button works without server routing.
export function useChildRoute(): string | null {
	const read = () => /^#\/child\/([0-9a-f]+)$/.exec(location.hash)?.[1] ?? null;
	const [childId, setChildId] = useState(read);
	useEffect(() => {
		const update = () => setChildId(read());
		window.addEventListener("hashchange", update);
		return () => window.removeEventListener("hashchange", update);
	}, []);
	return childId;
}
