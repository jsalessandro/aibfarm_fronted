import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/aibfarm_fronted/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  optimizeDeps: {
    force: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})