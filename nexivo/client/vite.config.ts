import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API = process.env.VITE_DEV_API ?? "http://localhost:4000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // Section content contracts shared with the API (server/src/schemas)
      "@shared": path.resolve(import.meta.dirname, "../server/src/schemas"),
    },
    dedupe: ["zod", "react", "react-dom"],
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": { target: API, changeOrigin: false },
      "/uploads": { target: API, changeOrigin: false },
      "/sitemap.xml": { target: API, changeOrigin: false },
      "/robots.txt": { target: API, changeOrigin: false },
    },
    fs: { allow: [".."] },
  },
  preview: {
    port: 4173,
    proxy: {
      "/api": { target: API, changeOrigin: false },
      "/uploads": { target: API, changeOrigin: false },
      "/sitemap.xml": { target: API, changeOrigin: false },
      "/robots.txt": { target: API, changeOrigin: false },
    },
  },
  build: {
    target: "es2022",
    sourcemap: false,
    chunkSizeWarningLimit: 700,
  },
});
