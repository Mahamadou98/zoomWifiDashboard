import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    port: 3000,
  },
  preview: {
    host: true, // Listen on all addresses in preview mode too
    port: 3000,
  },
});
