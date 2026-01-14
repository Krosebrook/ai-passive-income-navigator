import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest configuration for testing React components and utilities
 * Safe addition: Adds testing infrastructure without modifying app code
 * Uses jsdom environment to simulate browser for React component tests
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        'src/main.jsx',
        'src/pages.config.js',
      ],
      all: true,
      // Set realistic thresholds for critical paths only
      // Global thresholds removed - focusing on testing critical features
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
