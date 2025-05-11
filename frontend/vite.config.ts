import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/fs-api': {
        target: 'http://localhost:5505',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fs-api/, ''),
        secure: false,
        ws: true,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fs-api/, ''),
        secure: false,
        ws: true,
      }
    }
  },
})
