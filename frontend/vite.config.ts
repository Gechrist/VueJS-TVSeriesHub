// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// Vite resolve alias configuration
export default defineConfig({
	base: "/",
	plugins: [vue(), tailwindcss()],
	server: {
		port: 3000,
		host: true,
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
