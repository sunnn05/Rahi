import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // The service worker updates itself in the background and takes over
      // on the next load — no "new version available, click to refresh"
      // prompt to build, which this app doesn't need for week 1.
      registerType: 'autoUpdate',

      // We already hand-wrote public/manifest.webmanifest, so tell the
      // plugin to use that file instead of generating its own.
      manifest: false,

      workbox: {
        // Precache every built asset (JS, CSS, HTML, icons) so the app
        // shell — the rights list, contacts, SOS button — loads with zero
        // network requests once it has been opened once.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      },
    }),
  ],
})
