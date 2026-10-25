import { ArrowLeft } from "lucide-react";
import type React from "react";
import ChildPage from "./components/ChildPage";
import Home from "./components/Home";
import { useChildRoute, useToday } from "./lib/hooks";

const App: React.FC = () => {
	const childId = useChildRoute();
	const today = useToday();

	return (
		<div className="min-h-dvh bg-slate-50 text-slate-800">
			<header className="sticky top-0 z-10 bg-[#4f7cff] pt-[env(safe-area-inset-top)] text-white shadow">
				<div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
					{childId ? (
						<a
							href="#/"
							className="-ml-2 rounded-full p-2 hover:bg-white/20"
							aria-label="Back"
						>
							<ArrowLeft aria-hidden />
						</a>
					) : (
						<img src="/icon.svg" alt="" className="h-9 w-9" />
					)}
					<h1 className="text-xl font-bold">Kids Task Tracker</h1>
				</div>
			</header>
			<main className="mx-auto max-w-xl px-4 pb-[calc(4rem+env(safe-area-inset-bottom))] pt-5">
				{childId ? (
					<ChildPage childId={childId} today={today} />
				) : (
					<Home today={today} />
				)}
			</main>
		</div>
	);
};

export default App;
