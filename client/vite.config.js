import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // send /api calls to the Express server while developing
  server: { port: 5173, proxy: { '/api': 'https://auth-app-hrah.onrender.com' } },
});
