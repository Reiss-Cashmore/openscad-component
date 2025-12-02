import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBase = process.env.GITHUB_REPOSITORY?.split('/')[1];
const inferredBase = repoBase ? `/${repoBase}/` : '/';
const base =
  process.env.VITE_BASE ??
  process.env.TEST_APP_BASE ??
  inferredBase;

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 3001
  }
});
