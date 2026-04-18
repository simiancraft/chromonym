import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Deploy under /chromonym/ on GitHub Pages (repo name is the subpath).
  base: process.env.GITHUB_PAGES === 'true' ? '/chromonym/' : '/',
  server: {
    fs: {
      // Allow importing assets from the parent repo (e.g. .github/assets/banner.svg).
      // Build-time resolution doesn't need this; only the dev server does.
      allow: ['..'],
    },
  },
});
