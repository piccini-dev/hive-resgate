import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  // Netlify continua em /; Pages publica este repositório em /hive-resgate/.
  base: process.env.GITHUB_PAGES_BUILD === 'true' ? '/hive-resgate/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
