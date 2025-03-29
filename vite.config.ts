import { defineConfig } from "vite";
import path from "node:path";
import wasm from "vite-plugin-wasm";
import Inspect from "vite-plugin-inspect";
import { suppressViteLogs } from "./plugins/supress-vite-logs";

export default defineConfig({
  plugins: [wasm(), Inspect(), suppressViteLogs()],

  server: {
    port: 3333,
  },
  define: {
    SA_DEBUG: true,
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        format: "system",
        entryFileNames: "main.js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "source"),
      "@helpers": path.resolve(__dirname, "helpers"),
      "@data": path.resolve(__dirname, "data"),
    },
  },
});
