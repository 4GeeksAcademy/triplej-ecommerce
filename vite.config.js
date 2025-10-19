import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // p.ej.: https://musical-pancake-...-3001.app.github.dev/
  const backend = (env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

  return defineConfig({
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // Reenvía /products al backend (puerto 3001 en Codespaces)
        "/products": {
          target: backend,
          changeOrigin: true,
          secure: false, // Codespaces usa HTTPS con cert autofirmado
        },
        // Si más tarde expones /api/*:
        // "/api": { target: backend, changeOrigin: true, secure: false },
      },
    },
    build: { outDir: "dist" },
  });
};
