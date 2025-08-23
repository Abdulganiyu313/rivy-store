import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // dev proxy -> your API (adjust target if your API is on another port)
      "/api": { target: "http://localhost:4000", changeOrigin: true },
      "/products": { target: "http://localhost:4000", changeOrigin: true },
      "/checkout": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
