import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const electronOutputDir = resolve(__dirname, 'dist-electron');

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(electronOutputDir, 'main'),
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(electronOutputDir, 'preload'),
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/preload.ts'),
        },
      },
    },
  },
  renderer: {
    publicDir: resolve(__dirname, 'public'),
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer'),
      },
    },
    plugins: [react()],
    build: {
      outDir: resolve(electronOutputDir, 'renderer'),
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
        },
      },
    },
    optimizeDeps: {
      include: ['react-leaflet', 'leaflet'],
      exclude: [],
    },
  },
});
