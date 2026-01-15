import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@salesapexai/shared': path.resolve(__dirname, '../shared/dist'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['@salesapexai/shared'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/shared/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
});
