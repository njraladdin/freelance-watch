// vite.config.js
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
        theme_color: '#10B981', // Tailwind's green-500
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/images/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/images/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/images/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: '/images/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            src: '/images/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Additional Workbox configurations if needed
      },
    }),
  ],
});
