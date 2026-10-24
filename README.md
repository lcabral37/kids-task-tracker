# Kids Task Tracker

<img src="public/icon.svg" alt="" width="96" align="right">

An installable, offline-first PWA for parents to track their children's tasks and chores, and
the pocket money they earn for them. Everything is stored on the device in IndexedDB, so there's
no server or account: the app is a set of static files.

> **Status: early scaffold.** The data model, state store and components exist but aren't wired
> together yet. The app builds, installs and runs offline. See [Project status](#project-status).

## Planned features

- Child profiles
- A task list per child, with tasks you can tick off
- Daily earnings for completed tasks
- An offline action queue that syncs later
- Installable on phones and desktops (done)

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
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Local database | [Dexie](https://dexie.org) (IndexedDB) |
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
│   ├── App.tsx                # Root component
│   ├── index.css              # Tailwind directives
│   ├── components/            # ChildList, TaskList
│   ├── db/database.ts         # Dexie database and table schemas
│   ├── store/taskStore.ts     # Zustand store (children, tasks, earnings)
│   ├── services/              # service worker registration, offline action queue
│   └── worker/sw.ts           # service worker
├── deploy/                    # Caddyfile, socket-proxy config for autoheal
├── Dockerfile, compose.yaml   # container deployment (DEPLOY.md)
├── pwa-assets.config.ts       # icon generation
└── vite.config.ts             # build, PWA manifest
```

## Data model

The IndexedDB database `KidsTaskTrackerDB` (`src/db/database.ts`) has four tables:

| Table | Fields | Indexed by |
| --- | --- | --- |
| `children` | `id`, `name`, `age` | `id` |
| `tasks` | `id`, `title`, `description`, `isCompleted`, `childId` | `id`, `childId` |
| `dailyEarnings` | `id`, `date`, `amount` | `id` |
| `syncQueue` | `id`, `entity`, `action`, `payload` | `id` |

## Project status

- [x] Builds, installs as an app and works offline.
- [x] Container deployment with HTTPS ([DEPLOY.md](DEPLOY.md)).
- [ ] `App` doesn't render `ChildList` or `TaskList` yet.
- [ ] Components keep their own local state instead of using the Zustand store, and the store
      isn't saved to Dexie.
- [ ] `SyncService` keeps its queue in memory, not in the `syncQueue` table, and there's no
      server to sync with yet.
- [ ] Earnings rules (how much a task is worth) aren't defined yet.

## License

No license has been chosen yet.
