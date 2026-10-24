/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

export {};

// Filled in at build time by vite-plugin-pwa with every built file and its revision.
const PRECACHE = self.__WB_MANIFEST;
// The plugin lists the manifest and its icons a second time, and cache.addAll rejects duplicates.
const URLS = [...new Set(PRECACHE.map((e) => e.url))];
const CACHE_NAME = `ktt-${hash(PRECACHE.map((e) => `${e.url}@${e.revision}`).join("|"))}`;

function hash(text: string): string {
	let h = 0;
	for (let i = 0; i < text.length; i++)
		h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
	return (h >>> 0).toString(16);
}

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(URLS))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(
					names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (
		request.method !== "GET" ||
		new URL(request.url).origin !== self.location.origin
	)
		return;

	// Pages: network first so a deploy shows up straight away, the cached app shell when offline.
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request).catch(
				async () =>
					(await caches.match("index.html", { cacheName: CACHE_NAME })) ??
					Response.error(),
			),
		);
		return;
	}

	// The page loads its scripts with crossorigin, so they send an Origin header the precache requests
	// didn't; without ignoreVary, "Vary: Origin" or "Vary: Accept-Encoding" turns every lookup into a miss.
	event.respondWith(
		caches
			.match(request, { cacheName: CACHE_NAME, ignoreVary: true })
			.then((cached) => cached ?? fetch(request)),
	);
});
