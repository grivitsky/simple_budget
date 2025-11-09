import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './app',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'helpers': resolve(__dirname, './src/helpers'),
      'hooks': resolve(__dirname, './src/hooks'),
      'components': resolve(__dirname, './src/components'),
      'icons': resolve(__dirname, './src/icons'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});

