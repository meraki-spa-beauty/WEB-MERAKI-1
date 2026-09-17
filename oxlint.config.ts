import { defineConfig } from 'oxlint';

export default defineConfig({
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'tools/oxlint/anti-slop/**',
  ],
});
