// src/services/swRegister.ts

/**
 * Register a service worker.
 * @param {string} url - The URL of the service worker file.
 */
export const registerServiceWorker = (url: string) => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(url)
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }
};

/**
 * Unregister a service worker.
 * @param {string} url - The URL of the service worker file.
 */
export const unregisterServiceWorker = (url: string) => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                if (registration.active?.scriptURL === url) {
                    registration.unregister().then(result => {
                        console.log('Service Worker unregistered:', result);
                    });
                }
            }
        });
    }
};
