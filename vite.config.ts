import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			// Our own service worker (src/worker/sw.ts); the plugin only injects the list of built files.
			strategies: "injectManifest",
			srcDir: "src/worker",
			filename: "sw.ts",
			injectRegister: false,
			injectManifest: {
				globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
			},
			manifest: {
				name: "Kids Task Tracker",
				short_name: "Kids Tasks",
				description: "Track your kids' tasks and the pocket money they earn.",
				start_url: "/",
				scope: "/",
				display: "standalone",
				background_color: "#ffffff",
				theme_color: "#4f7cff",
				icons: [
					{ src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
					{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
					{ src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
					{
						src: "maskable-icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
		}),
	],
	server: {
		port: 3000,
		open: true,
	},
	build: {
		outDir: "dist",
		sourcemap: false,
	},
});
