# PC Forge

Angular web app for building a desktop PC from base components (CPU, motherboard, memory, storage, optional GPU, PSU, case, cooling).

**Live demo (GitHub Pages):** https://jiddisch.github.io/pc-forge/

## Requirements

- **Node.js 22.22.3+**
- npm 10+

## Quick start (local API + frontend)

Local development uses a tiny **Express + SQLite** API. GitHub Pages still uses **MSW** (no public API yet).

Terminal 1 — API (creates `server/data/pc-forge.db` and seeds on first run):

```bash
npm install
npm run api
```

API listens on http://localhost:3000 (falls back to 3333 if busy).

Terminal 2 — Angular (proxies `/api` → Express; MSW disabled in development):

```bash
npm start
```

Open http://localhost:4200/

- Home: landing overview
- Builder: pick parts by category, filter with signal forms, see live total + compatibility hints

### Sample API calls

```bash
curl 'http://localhost:3000/api/parts?category=cpu'
curl 'http://localhost:3000/api/parts/cpu-ryzen-9-9950x'
curl 'http://localhost:3000/api/categories'
```

### Add a part via CLI

```bash
npm run parts:add -- \
  --category cpu \
  --brand AMD \
  --name "Ryzen 9 9950X" \
  --price 549 \
  --specs '{"socket":"AM5","cores":16,"threads":32,"tdpW":170,"integratedGraphics":true}' \
  --imageUrl "https://picsum.photos/seed/9950x/400/300"
```

Force re-seed (wipes and reloads catalog):

```bash
npm run api:seed
```

## Stack

- Angular 22 (standalone, zoneless, external templates)
- Tailwind CSS v4 (`@import "tailwindcss"` + `@tailwindcss/postcss`)
- Angular Material (azure-blue theme)
- Angular PWA (`@angular/pwa` + `ngsw-config.json`)
- Signal Forms (`@angular/forms/signals`) for catalog filters
- **Local API:** Express + `better-sqlite3` (single file under `server/data/`, gitignored)
- **MSW** for `/api/parts` when running the static GitHub Pages build (`environment.useMsw: true`)

## API contract

Same shapes for Express and MSW:

- `GET /api/parts?category=&brand=&q=&maxPrice=` → `{ items: Part[], total: number }`
- `GET /api/parts/:id` → `Part`
- `GET /api/categories` → `{ counts: Record<string, number> }`
- `POST /api/parts` (local API / CLI) → created `Part`

## Dev vs Pages

| Mode | Data source | How |
|------|-------------|-----|
| `ng serve` (development) | Express + SQLite | `proxy.conf.json` → `localhost:3000`; `useMsw: false` |
| GitHub Pages / production build | MSW in the browser | `useMsw: true`; no backend on static hosting |

Worker URL is resolved from `document.baseURI` so MSW works under the `/pc-forge/` Pages base path.

## Deploy to GitHub Pages

Site URL: **https://jiddisch.github.io/pc-forge/**

One-time repo setup: GitHub → Settings → Pages → Source = **Deploy from a branch** → Branch **`gh-pages`** / **/ (root)**.

```bash
npm run build:pages
npm run deploy:pages
```

`build:pages` sets `baseHref` to `/pc-forge/` and copies `index.html` → `404.html` for SPA deep links. `deploy:pages` publishes `dist/pc-forge/browser` to the `gh-pages` branch.

Until a public API exists, the Pages build continues to use MSW with the mock catalog in `src/mocks/`.

## Folder overview

```
server/           # Express + SQLite API, seed, CLI
  data/           # pc-forge.db (gitignored)
  cli/add-part.mjs
src/app/
  core/           # models, category config, PartsService, BuildService
  shared/         # part-card, price pipe
  layout/shell/   # responsive app shell (header + main + footer)
  features/
    home/         # landing
    builder/      # category nav, catalog, filters, live summary
src/environments/ # useMsw flag (dev off / prod on)
src/mocks/        # MSW handlers + catalog (Pages)
public/           # PWA icons, manifest, MSW worker
proxy.conf.json   # /api → localhost:3000
```

## Scripts

```bash
npm run api           # start Express + SQLite on :3000
npm run api:seed      # wipe + re-seed SQLite catalog
npm run parts:add     # CLI insert a part
npm start             # Angular dev server (with /api proxy)
ng build              # production build
npm run build:pages   # production build for GitHub Pages (/pc-forge/ + 404.html)
npm run deploy:pages  # build:pages then publish to gh-pages
ng test               # unit tests (Vitest)
```

## Notes

- GPU is optional when the selected CPU has integrated graphics.
- Basic compatibility checks: CPU↔motherboard socket, RAM type, cooler/GPU fit vs case, PSU headroom.
- Part `imageUrl` values are placeholders (`picsum.photos` seeds); replace with real assets later.
- Do not commit `server/data/*.db` or secrets.
