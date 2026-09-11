# PC Forge

Angular web app for building a desktop PC from base components (CPU, motherboard, memory, storage, optional GPU, PSU, case, cooling).

**Live demo (GitHub Pages):** https://jiddisch.github.io/pc-forge/

## Requirements

- **Node.js 22.22.3+** (verified with v22.22.3)
- npm 10+

On this box, put Node first on `PATH`:

```bash
export PATH="/home/box/.local/node/bin:$PATH"
```

## Quick start

```bash
cd /workspace/pc-forge
export PATH="/home/box/.local/node/bin:$PATH"
npm install
ng serve
```

Open http://localhost:4200/

- Home: landing overview
- Builder: pick parts by category, filter with signal forms, see live total + compatibility hints

## Stack

- Angular 22 (standalone, zoneless, external templates)
- Tailwind CSS v4 (`@import "tailwindcss"` + `@tailwindcss/postcss`)
- Angular Material (azure-blue theme)
- Angular PWA (`@angular/pwa` + `ngsw-config.json`)
- Signal Forms (`@angular/forms/signals`) for catalog filters
- MSW (Mock Service Worker) for `/api/parts` browser mocks

## MSW notes

- Handlers live in `src/mocks/` (`handlers.ts`, `browser.ts`, `data/parts.ts`)
- Worker script: `public/mockServiceWorker.js` (generated via `npx msw init public/`)
- `src/main.ts` starts the worker before bootstrapping the app
- Worker URL is resolved from `document.baseURI` so it works under the `/pc-forge/` Pages base path
- API shape (ready for a real backend later):
  - `GET /api/parts?category=cpu&q=&maxPrice=`
  - `GET /api/parts/:id`
  - `GET /api/categories`

In production builds the worker still starts in the browser when the app boots; swap `PartsService` to a real API when ready and remove or gate the MSW import.

## Deploy to GitHub Pages

Site URL: **https://jiddisch.github.io/pc-forge/**

One-time repo setup: GitHub → Settings → Pages → Source = **Deploy from a branch** → Branch **`gh-pages`** / **/ (root)**.

Build (sets `baseHref` to `/pc-forge/`, copies `index.html` → `404.html` for SPA deep links):

```bash
export PATH="/home/box/.local/node/bin:$PATH"
cd /workspace/pc-forge
npm run build:pages
```

Publish the browser output to the `gh-pages` branch (SSH remote):

```bash
npx angular-cli-ghpages --dir=dist/pc-forge/browser --no-silent
# or: npm run deploy:pages
```

Then push any source changes on `main` as usual.

## Folder overview

```
src/app/
  core/           # models, category config, PartsService, BuildService
  shared/         # part-card, price pipe
  layout/shell/   # responsive app shell (header + main + footer)
  features/
    home/         # landing
    builder/      # category nav, catalog, filters, live summary
src/mocks/        # MSW handlers + seed catalog
public/           # PWA icons, manifest, MSW worker
```

## Scripts

```bash
ng serve          # dev server
ng build          # production build
npm run build:pages   # production build for GitHub Pages (/pc-forge/ + 404.html)
npm run deploy:pages  # build:pages then publish to gh-pages
ng test           # unit tests (Vitest)
```

## Notes

- GPU is optional when the selected CPU has integrated graphics.
- Basic compatibility checks: CPU↔motherboard socket, RAM type, cooler/GPU fit vs case, PSU headroom.
- Part `imageUrl` values are placeholders (`picsum.photos` seeds); replace with DB/S3 later.
