import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      // Resolve CLI shell-metrics to source so vi.mock('@bradygaster/squad-sdk')
      // intercepts correctly. Without this, npm ci may install a duplicate squad-sdk
      // under squad-cli/node_modules which bypasses the mock.
      '@bradygaster/squad-cli/shell/shell-metrics': path.resolve(__dirname, 'packages/squad-cli/src/cli/shell/shell-metrics.ts'),
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts', 'packages/*/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.d.ts', '**/node_modules/**'],
    },
  },
});
