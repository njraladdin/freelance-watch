import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Progress Tracker',
        short_name: 'ProgressTracker',
        description: 'Track your daily activities, earnings, and overall progress with our comprehensive dashboard.',
        theme_color: '#3d5172',
        background_color: '#3d5172',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/images/logo-512x512.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/images/logo-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
});
