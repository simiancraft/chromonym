# chromonym demo

A standalone, isolated Vite + React demo of chromonym. Lives in its own subfolder with its own `package.json` so the root chromonym package stays lean (no React, no Vite).

## Develop

```sh
# first, build chromonym from the repo root (demo imports from the built dist):
cd ..
bun run build

# then run the demo:
cd demo
bun install
bun run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Deploy

The `.github/workflows/deploy-demo.yml` workflow builds this folder on every push to `main` and publishes to GitHub Pages. The live site is reached from the "Demo →" button in the main README.

## Stack

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS v4 via `@tailwindcss/vite` (build-time, no CDN — avoids the dev-only console warning in production)
- chromonym linked via `"chromonym": "file:.."` (always tracks the library's source)
