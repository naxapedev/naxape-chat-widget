import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  server: {
    port: 5174,
    cors: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: path.resolve(import.meta.dirname, "src/widget-entry.tsx"),
      name: "NaxapeChatWidget",
      fileName: () => `widget.js`,
      formats: ["iife"],
    },
    cssCodeSplit: false,
    minify: true,
  },
});
