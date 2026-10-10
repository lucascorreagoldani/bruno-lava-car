import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/v1": {
        target: "http://localhost:3333",
        changeOrigin: true
      }
    }
  }
});
