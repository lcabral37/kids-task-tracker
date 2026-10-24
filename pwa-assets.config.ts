import {
	defineConfig,
	minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

// Full-bleed icons get the SVG's background colour behind them. Android masks "maskable" icons to a
// circle (safe zone: the middle 80%), so the artwork is shrunk to keep the plus badge inside it.
const background = "#4f7cff";

export default defineConfig({
	headLinkOptions: { preset: "2023" },
	preset: {
		...minimal2023Preset,
		maskable: {
			...minimal2023Preset.maskable,
			padding: 0.3,
			resizeOptions: { background },
		},
		apple: {
			...minimal2023Preset.apple,
			padding: 0.1,
			resizeOptions: { background },
		},
	},
	images: ["public/icon.svg"],
});
