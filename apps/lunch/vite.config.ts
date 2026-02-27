import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tailwindVitePlugin } from '@choblue/tailwind-config/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [TanStackRouterVite(), react(), tailwindVitePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3100,
  },
});
