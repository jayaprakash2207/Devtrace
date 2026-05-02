import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    server: {
      port: 5173,
      proxy: {
        // In development, forward every /api/* call to the local Express server.
        // No path rewriting needed — the backend is now mounted at /api/*.
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },

    build: {
      // Warn only on chunks > 600 kB
      chunkSizeWarningLimit: 600,
    },
  };
});
