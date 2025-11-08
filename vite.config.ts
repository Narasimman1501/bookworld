import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    base: '/bookworld/',
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: [
        'unirenic-wamblingly-an.ngrok-free.dev', // 👈 Allow your ngrok domain
        // You can add more hosts if needed
        // 'example-tunnel.ngrok-free.app'
      ]
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
