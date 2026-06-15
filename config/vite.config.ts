import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true, // needed in Docker — binds to 0.0.0.0 instead of localhost
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
  },
  // Exclude the softrender library from optimization. WASM libraries can cause issues when optimized by Vite, so we exclude it to ensure it works correctly.
  optimizeDeps: { exclude: ["softrender"] },
});
