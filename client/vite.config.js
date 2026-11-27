import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During local development the client runs on :5173 and proxies API calls to
// the Express server on :3000. In production the server serves the built files,
// so no proxy is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
  },
});
