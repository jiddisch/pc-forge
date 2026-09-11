# PC Forge

Angular web app for building a desktop PC from base components (CPU, motherboard, memory, storage, optional GPU, PSU, case, cooling).

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
- API shape (ready for a real backend later):
  - `GET /api/parts?category=cpu&q=&maxPrice=`
  - `GET /api/parts/:id`
  - `GET /api/categories`

In production builds the worker still starts in the browser when the app boots; swap `PartsService` to a real API when ready and remove or gate the MSW import.

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
ng test           # unit tests (Vitest)
```

## Notes

- GPU is optional when the selected CPU has integrated graphics.
- Basic compatibility checks: CPU↔motherboard socket, RAM type, cooler/GPU fit vs case, PSU headroom.
- Part `imageUrl` values are placeholders (`picsum.photos` seeds); replace with DB/S3 later.
