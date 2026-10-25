# Year in MAL

Your year in anime, wrapped. Log in with MyAnimeList and scroll through a recap of
the anime you finished: your favourites, hot takes against the MAL crowd, hidden gems,
genres, studios, the ones you dropped and a shareable summary.

Try it without an account at `/?demo`.

## How it works

- **Frontend** (`src/`): React 19 with the React Compiler, Tailwind CSS 4 and no UI
  framework. The story is a column of full-screen chapters using native CSS scroll
  snapping, scroll-driven animations, the Popover API and View Transitions.
  `src/lib/stats.ts` turns a MAL anime list into the year in review; each chapter in
  `src/chapters/` renders one part of it and is skipped when there isn't enough data.
- **Backend** (`functions/`): Cloudflare Pages Functions handle the MAL OAuth flow
  (PKCE with a `state` check) and proxy the MAL API. Tokens live in signed, HTTP-only
  cookies and are refreshed automatically; nothing is stored server-side.
  - `GET /api/login` → MAL consent screen → `GET /api/callback`
  - `GET /api/me`, `GET /api/animelist` (all pages of the list)
  - `POST /api/logout`
- **Demo mode** (`src/demo/`): a generated list over a catalogue of real anime. Rebuild
  the catalogue with `pnpm run demo-catalog` (it uses AniList's public API).

## Development

Requires Node.js 22.18+ and pnpm (`corepack enable` picks the version from
`package.json`).

```bash
pnpm install
pnpm run dev            # Vite+ dev server; /api is proxied to localhost:8788
pnpm run dev:functions  # Pages functions via wrangler (needs .dev.vars)
pnpm run check          # format, lint and type checks
pnpm run test           # unit tests
pnpm run build
pnpm run e2e            # Playwright, against the build served by wrangler
```

For the functions, copy `.dev.vars.example` to `.dev.vars` and fill in a MAL API
client from <https://myanimelist.net/apiconfig>. Its redirect URL must be
`<origin>/api/callback` for every origin you log in from (for example
`http://localhost:5173/api/callback` for `pnpm run dev`).

## End-to-end tests

`e2e/demo.spec.ts` runs on desktop and mobile viewports without any credentials.

`e2e/live.spec.ts` logs into a real MyAnimeList account, adds a few anime to its list
through the API and checks they appear in the recap. It runs when `MAL_USERNAME` and
`MAL_PASSWORD` are set and `.dev.vars` holds a MAL client that allows
`http://localhost:8788/api/callback`. In CI these come from the `MAL_USERNAME`,
`MAL_PASSWORD`, `MAL_CLIENT_ID` and `MAL_CLIENT_SECRET` repository secrets.

## Deployment

Cloudflare Pages builds with `pnpm run build` and serves `dist/` together with
`functions/`. Set `CLIENT_ID`, `CLIENT_SECRET` and `COOKIE_SECRET` on the Pages
project.
