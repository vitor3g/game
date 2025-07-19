import path from 'node:path';
import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';
// import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';
import { suppressViteLogs } from './plugins/supress-vite-logs';

export default defineConfig({
  plugins: [
    wasm(),
    Inspect(),
    suppressViteLogs(),
   
  ],

  server: {
    port: 3333,
  },
  define: {
    DZ_DEBUG: true,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [
        path.join(__dirname, "/source/server")
      ],
      output: {
        format: 'es',
      },
    },
  },

  optimizeDeps: {
    include: ['ammojs-typed'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'source'),
      '@helpers': path.resolve(__dirname, 'helpers'),
      '@data': path.resolve(__dirname, 'data'),
    },
  },
});
