import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
 
const __dirname = path.dirname(fileURLToPath(import.meta.url));
 
export default async () => {
  const plugins = [
    react(),
    runtimeErrorOverlay()
  ];
 
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }
 
  return defineConfig({
    plugins,
    server: {
      host: "0.0.0.0",
      port: 5000,
      allowedHosts: ['mysafetydemo.venpep.net', 'localhost', '127.0.0.1', '.venpep.net'],
      hmr: {
        host: 'localhost'
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
  });
};