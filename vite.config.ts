import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // base tells Vite that the app will be served from /new-discovery/ on GitHub Pages
  // Without this, all asset links (JS, CSS, images) would use "/" and break
  base: '/new-discovery/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  cacheDir: '/tmp/vite-cache',
  optimizeDeps: {
    // Only scan index.html for dependencies — prevents Vite from trying to
    // resolve external assets referenced in smartplanner-local.html (a staging
    // HTML snapshot from the real TripBuilder app that lives here for reference).
    entries: ['index.html'],
  },
})
