# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Development

Requires Node.js 22.18+ and pnpm (`corepack enable` picks the version from `package.json`).

```bash
pnpm install
pnpm run dev            # Vite+ dev server (proxies /api to localhost:8788)
pnpm run dev:functions  # Cloudflare Pages functions via wrangler
pnpm run lint           # Oxlint via Vite+ (lint options live in vite.config.ts)
pnpm run build
```
