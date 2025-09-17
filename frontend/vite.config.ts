import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 라이브러리를 별도 청크로 분리
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          // React Flow를 별도 청크로 분리 (큰 라이브러리)
          'reactflow': ['reactflow'],
          // 폼 관련 라이브러리 분리
          'form-vendor': ['react-hook-form', 'zustand'],
          // 유틸리티 라이브러리 분리
          'utils-vendor': ['axios', 'immer'],
          // DnD 라이브러리 분리
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // 600KB로 경고 임계값 상향 조정
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
