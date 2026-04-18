import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Deploy under /chromonym/ on GitHub Pages (repo name is the subpath).
  base: process.env.GITHUB_PAGES === 'true' ? '/chromonym/' : '/',
});
