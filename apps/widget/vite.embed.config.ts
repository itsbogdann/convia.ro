import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';

// Build config for the embeddable widget - outputs a single JS file
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJs(), // Injects CSS into JS for single-file embed
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Same alias as the main config — read shared-types from source so
      // Rollup can statically resolve its named exports.
      '@convia/shared-types': resolve(__dirname, '../../packages/shared-types/src/index.ts'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't wipe the main build output
    lib: {
      entry: resolve(__dirname, 'src/embed.tsx'),
      name: 'ConviaWidget',
      fileName: () => 'embed',
      formats: ['iife'], // Single file for <script> tag
    },
    rollupOptions: {
      output: {
        // Ensure everything is bundled into one file
        inlineDynamicImports: true,
        manualChunks: undefined,
        entryFileNames: 'embed.js',
      },
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
});
