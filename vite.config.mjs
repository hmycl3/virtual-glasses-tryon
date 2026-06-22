import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/virtual-glasses-tryon/" : "/",
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    port: 5173,
    host: "127.0.0.1",
    watch: { ignored: ["**/qa/**"] },
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
