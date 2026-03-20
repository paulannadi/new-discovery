import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
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
