import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'  // match your server PORT in .env
    }
  }
}