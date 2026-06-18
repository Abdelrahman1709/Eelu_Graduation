import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      protocol: 'ws',
      timeout: 60000,
    },
  },
  build: {
    // Enable minification for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth'],
          'react-vendors': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendors': ['framer-motion', 'react-hot-toast'],
          'query': ['@tanstack/react-query'],
        }
      }
    },
    // Treeshake unused code
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
    // Smaller chunk size threshold for better caching
    chunkSizeWarningLimit: 1000,
    // Better CSS handling
    cssMinify: 'lightningcss',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth',
      'react-router-dom',
      'framer-motion',
      '@tanstack/react-query',
    ],
  },
})