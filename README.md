
<img src="public/icon.svg" alt="" width="96" align="right">

An installable, offline-first PWA for parents to track their children's tasks and chores, and
the pocket money they earn for them. Everything is stored on the device in IndexedDB, so there's
no server or account: the app is a set of static files.

## Features

- **Children.** Add each child with a name and an animal picture. The home screen shows every
  child's progress today, what they earned today and what they've saved up.
- **Tasks.** Give each child tasks with a reward, either every day or just once. Kids tick them
  off with a tap, and tap again to undo. Daily tasks start fresh each morning; a one-off task
  disappears the day after it's done.
- **Pocket money.** Each tick adds the task's reward. **Pay out** records that you've handed over
  the money and resets what's saved up. Changing or deleting a task never changes what was
  already earned.
- **Works offline and installs** on phones and desktops.

Amounts are shown in NOK; change `CURRENCY` in `src/lib/format.ts` for another currency.

## Getting started

Requires Node.js 20 or newer; `.nvmrc` pins Node 24.

```bash
nvm use
npm install
npm run dev          # http://localhost:3000, no service worker
npm run build        # type-check, then build to dist/
npm run preview      # serve dist/ at http://localhost:4173, with the service worker
npm run type-check
npm run icons        # regenerate the PNG icons and favicon from public/icon.svg
```

The service worker only runs in the production build, so use `npm run build && npm run preview`
to test installing the app or using it offline.

## Tech stack

| Area | Tool |
| --- | --- |
| UI | [React 18](https://react.dev) + TypeScript |
| Build | [Vite 5](https://vitejs.dev) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) |
| Data | [Dexie](https://dexie.org) (IndexedDB); screens read it with `useLiveQuery`, so they update by themselves after every change |
| Icons | [lucide-react](https://lucide.dev) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app) (manifest and precache list) with our own service worker; [@vite-pwa/assets-generator](https://vite-pwa-org.netlify.app/assets-generator/) for icons |
| Hosting | [Caddy](https://caddyserver.com) in Docker (see [DEPLOY.md](DEPLOY.md)) |

## Installable app

- **Manifest.** `vite.config.ts` defines it; the build writes `dist/manifest.webmanifest` and
  links it from `index.html`.
- **Icon.** `public/icon.svg` (a kid with a green plus badge) is the source. `npm run icons`
  renders the PNGs and `favicon.ico` next to it, using `pwa-assets.config.ts`; the generated
  files are committed. The maskable and Apple icons get the blue background and extra padding,
  because Android crops maskable icons to a circle.
- **Service worker.** `src/worker/sw.ts`. At build time vite-plugin-pwa injects the list of
  built files with their revisions, and the worker:
  - precaches all of them on install, in a cache named after a hash of that list, so every
    deploy gets a fresh cache and the old one is deleted on activate;
  - answers page loads from the network, falling back to the cached `index.html` when offline
    (deep links work offline too);
  - answers everything else from the cache first.
- **Registration.** `src/main.tsx` registers `/sw.js` in production builds only
  (`src/services/swRegister.ts`).

## Project structure

```
├── index.html                 # HTML entry point
├── public/                    # icon.svg and the generated icons, copied as-is into dist/
├── src/
│   ├── main.tsx               # React entry point, registers the service worker
│   ├── App.tsx                # Header and routing (#/ and #/child/<id>)
│   ├── index.css              # Tailwind directives
│   ├── components/            # Home, ChildPage and their parts
│   ├── db/database.ts         # Dexie database and table schemas
│   ├── db/actions.ts          # every write, and the per-child summary for a day
│   ├── lib/                   # money and date formatting, colours, hooks
│   ├── services/              # service worker registration, sync queue (unused yet)
│   └── worker/sw.ts           # service worker
├── deploy/                    # Caddyfile, socket-proxy config for autoheal
├── Dockerfile, compose.yaml   # container deployment (DEPLOY.md)
├── pwa-assets.config.ts       # icon generation
└── vite.config.ts             # build, PWA manifest
```

## Data model

The IndexedDB database `KidsTaskTrackerDB` (`src/db/database.ts`). Ids are random strings, so
records from different devices can be merged once there's sync. Money is in minor units (øre).

| Table | Fields | Indexed by |
| --- | --- | --- |
| `children` | `id`, `name`, `avatar`, `color`, `createdAt` | `id` |
| `tasks` | `id`, `childId`, `title`, `reward`, `repeat` (`daily` or `once`), `createdAt` | `id`, `childId` |
| `completions` | `id`, `taskId`, `childId`, `date` (local `YYYY-MM-DD`), `reward` | `id`, `childId`, `taskId`, `[taskId+date]` |
| `payouts` | `id`, `childId`, `amount`, `date` | `id`, `childId` |
| `syncQueue` | `id`, `entity`, `action`, `payload` | `id` |

Earned today is the sum of today's completions; saved up is all completions minus all payouts.

## Project status

- [x] Builds, installs as an app and works offline.
- [x] Container deployment with HTTPS ([DEPLOY.md](DEPLOY.md)).
- [x] Children, tasks, ticking off, earnings and payouts, saved on the device.
- [ ] `SyncService` stores queued changes in the `syncQueue` table, but nothing adds to it yet
      and there's no server to sync with, so data isn't shared between devices.
- [ ] No history screen yet (past days and payouts are stored but not shown).
- [ ] No backup or export: clearing the browser's data deletes everything.
- [ ] No automated tests.

## License

No license has been chosen yet.
