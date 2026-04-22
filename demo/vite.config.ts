import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// React Compiler (v1) auto-memoizes components, derived values, and
// callbacks at build time. Lets us avoid sprinkling `React.memo` /
// `useMemo` / `useCallback` across the demo for pure-perf reasons;
// semantic uses of those hooks (lazy-init state, stable refs that
// must NOT be recomputed) remain explicit in the source.
//
// @vitejs/plugin-react v6 drops its classic-Babel pipeline in favor of
// Rolldown, so React Compiler is wired through @rolldown/plugin-babel
// with the `reactCompilerPreset` helper. `target: '18'` pairs with
// `react-compiler-runtime` so the compiler's emitted helpers land on
// a React-18 compatible runtime (this demo is still on React 18.3).

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset({ target: '18' })] }),
    tailwindcss(),
  ],
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
