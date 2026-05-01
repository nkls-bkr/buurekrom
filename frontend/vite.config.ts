import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  build: {
    // There has been a problem with geoman when minifying the css.
    // Temporarily disabling it to realize testing.
    cssMinify: false,
  },
});
