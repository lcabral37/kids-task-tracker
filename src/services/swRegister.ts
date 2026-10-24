// src/services/swRegister.ts

/**
 * Register a service worker.
 * @param {string} url - The URL of the service worker file.
 */
export const registerServiceWorker = (url: string) => {
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register(url)
				.then((registration) => {
					console.log(
						"Service Worker registered with scope:",
						registration.scope,
					);
				})
				.catch((error) => {
					console.error("Service Worker registration failed:", error);
				});
		});
	}
};

/**
 * Unregister a service worker.
 * @param {string} url - The URL of the service worker file.
 */
export const unregisterServiceWorker = (url: string) => {
	if ("serviceWorker" in navigator) {
		// scriptURL is always absolute, so "/sw.js" has to be resolved before comparing.
		const scriptURL = new URL(url, location.href).href;
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			for (const registration of registrations) {
				if (registration.active?.scriptURL === scriptURL) {
					registration.unregister().then((result) => {
						console.log("Service Worker unregistered:", result);
					});
				}
			}
		});
	}
};
