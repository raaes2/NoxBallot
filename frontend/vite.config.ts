import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

// WHY wasm() and topLevelAwait() are mandatory:
// - Midnight SDK uses WebAssembly for ZK proving in the browser
// - Without wasm(): TypeError: WebAssembly.instantiate() is not a function
// - Without topLevelAwait(): SyntaxError: await is only valid in async functions

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  define: {
    global: 'globalThis',
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['@midnight-ntwrk/ledger-v8'],
  },
});
