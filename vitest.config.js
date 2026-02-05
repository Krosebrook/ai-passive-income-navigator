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
      include: [
        'src/utils/**/*.{js,jsx,ts,tsx}',
        'src/lib/**/*.{js,jsx,ts,tsx}',
        'src/api/**/*.{js,jsx,ts,tsx}',
        'src/hooks/**/*.{js,jsx,ts,tsx}',
      ],
      exclude: [
        'src/test/**',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/main.jsx',
        'src/pages.config.js',
        'src/lib/NavigationTracker.jsx',
        'src/lib/PageNotFound.jsx',
        'src/lib/query-client.js',
      ],
      all: true,
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
