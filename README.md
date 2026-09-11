# PC Forge

Angular web app for building a desktop PC from base components (CPU, motherboard, memory, storage, optional GPU, PSU, case, cooling).

**Live demo (GitHub Pages):** https://jiddisch.github.io/pc-forge/

## Requirements

- **Node.js 22.22.3+**
- npm 10+

## Quick start

Catalog data lives in a static JSON file — no API server required.

```bash
npm install
npm start
```

Open http://localhost:4200/

- Home: landing overview
- Builder: pick parts by category (`/builder/cpu`, `/builder/gpu`, …), filter with signal forms, see live total + compatibility hints

MSW is always enabled (local and production). It serves `/api/*` from `public/data/parts.json`.

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

This appends to `public/data/parts.json`. Commit and redeploy for GitHub Pages to pick up the change (the browser cannot write the repo file).

## Stack

- Angular 22 (standalone, zoneless, external templates)
- Tailwind CSS v4 (`@import "tailwindcss"` + `@tailwindcss/postcss`)
- Angular Material (azure-blue theme)
- Angular PWA (`@angular/pwa` + `ngsw-config.json`)
- Signal Forms (`@angular/forms/signals`) for catalog filters
- **`public/data/parts.json`** — single source of truth for the catalog
- **MSW** always on — mocks `GET /api/parts`, `GET /api/parts/:id`, `GET /api/categories` by loading that JSON

## API contract (MSW)

- `GET /api/parts?category=&brand=&q=&maxPrice=` → `{ items: Part[], total: number }`
- `GET /api/parts/:id` → `Part`
- `GET /api/categories` → `{ counts: Record<string, number> }`

Writes go through the CLI (`npm run parts:add`), not HTTP.

## Deploy to GitHub Pages

Site URL: **https://jiddisch.github.io/pc-forge/**

One-time repo setup: GitHub → Settings → Pages → Source = **Deploy from a branch** → Branch **`gh-pages`** / **/ (root)**.

```bash
npm run build:pages
npm run deploy:pages
```

`build:pages` sets `baseHref` to `/pc-forge/` and copies `index.html` → `404.html` for SPA deep links. `deploy:pages` publishes `dist/pc-forge/browser` to the `gh-pages` branch.

After deploy, Pages serves the same `data/parts.json` catalog that local MSW uses.

## Folder overview

```
public/data/parts.json   # catalog source of truth
scripts/add-part.mjs     # CLI to append parts
src/app/
  core/                  # models, category config, PartsService, BuildService
  shared/                # part-card, price pipe
  layout/shell/          # responsive app shell (header + main + footer)
  features/
    home/                # landing
    builder/             # category nav, catalog, filters, live summary
src/mocks/               # MSW handlers (load parts.json)
public/                  # PWA icons, manifest, MSW worker, data/
```

## Scripts

```bash
npm start             # Angular dev server (MSW serves /api from parts.json)
npm run parts:add     # CLI append a part to public/data/parts.json
ng build              # production build
npm run build:pages   # production build for GitHub Pages (/pc-forge/ + 404.html)
npm run deploy:pages  # build:pages then publish to gh-pages
ng test               # unit tests (Vitest)
```

## Notes

- GPU is optional when the selected CPU has integrated graphics.
- Basic compatibility checks: CPU↔motherboard socket, RAM type, cooler/GPU fit vs case, PSU headroom.
- Part `imageUrl` values are placeholders (`picsum.photos` seeds); replace with real assets later.
