import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        sw: 'src/worker/sw.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'sw' ? '[name].js' : 'assets/[name].js';
        },
        chunkFileNames: 'assets/[name].js',
        manualChunks: undefined,
      },
    },
    chunkSizeWarningLimit: Infinity,
  }
});