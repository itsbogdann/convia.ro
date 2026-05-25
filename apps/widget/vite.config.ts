import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Read shared-types TS source directly — its CJS dist
      // (`Object.defineProperty` re-exports) confuses Rollup's named-import
      // resolver. Source is type-safe and Vite transforms TS on the fly.
      '@convia/shared-types': resolve(__dirname, '../../packages/shared-types/src/index.ts'),
    },
  },
  server: {
    port: 9003,
    cors: true,
    headers: {
      'Content-Security-Policy': "frame-ancestors *",
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  assetsInclude: ['**/*.svg'],
});
