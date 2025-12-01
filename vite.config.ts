import react from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Only include polyfills for modules that are actually needed by wagmi
      include: ["buffer", "process", "crypto", "events"],
    }) as unknown as PluginOption,
  ],
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime", "framer-motion"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query"],
    esbuildOptions: {
      preserveSymlinks: true,
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    minify: "esbuild",
    target: "esnext",
  },
  server: {
    port: 9527,
  },
});
