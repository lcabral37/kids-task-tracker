# Deploying Kids Task Tracker

## How production is set up

```
phone ──HTTPS──▶ Caddy ──▶ static files (dist/, built by `npm run build`)
```

- **There's no server-side data.** Each device keeps its own data in IndexedDB, so there's no
  API, database or backup to run. Deploying means serving the built files over HTTPS, which
  browsers require before they'll install the app or run its service worker.
- **`npm run build`** writes `dist/`. Scripts and styles go into `dist/assets/` with a content
  hash in the name, so they can be cached for a year. The service worker's file list and cache
  name come from the same build, so every deploy updates installed apps: they pick up the new
  version on the next launch with a connection.
- **Caddy** gets and renews HTTPS certificates by itself. It serves the files with compression,
  security headers (including a strict Content Security Policy), long-term caching for
  `/assets/*` and `no-cache` for everything else, so `sw.js` and `index.html` are always
  revalidated. Unknown paths get `index.html`, so deep links work.

## Option A: one server with Docker Compose (recommended)

This works on any Linux machine with Docker: a small VPS or an always-on device at home,
including a 64-bit Raspberry Pi.

1. Point a DNS name at the machine, for example `tasks.example.com`. A home connection needs a
   public IPv4 address and ports 80 and 443 forwarded to the device.
2. Copy the project to the machine. Then run:

   ```bash
   DOMAIN=tasks.example.com docker compose up -d --build
   ```

3. Open `https://tasks.example.com`, then use the browser's **Install app** or **Add to Home
   Screen**.

To update, run `git pull`, then the same `docker compose up -d --build`.

| Variable | Default | |
| --- | --- | --- |
| `DOMAIN` | `localhost` | the public host name; `:80` serves plain HTTP behind another proxy |
| `HTTP_PORT` | `80` | host port for HTTP (redirects to HTTPS) |
| `HTTPS_PORT` | `443` | host port for HTTPS (TCP and UDP, for HTTP/3) |

With the default `DOMAIN=localhost`, Caddy uses its own local certificate authority, which
browsers don't trust. Use a real domain for anything but a quick check.

All containers run with all Linux capabilities dropped (Caddy keeps only `NET_BIND_SERVICE`)
and `no-new-privileges`, on a read-only filesystem. Caddy's certificates live in the
`caddy-data` volume.

### Restarting on its own

| Situation | What happens |
| --- | --- |
| Caddy crashes or exits | Docker restarts it (`restart: unless-stopped`) |
| Caddy hangs | Its health check fails three times, 15 s apart; **autoheal** then restarts it |
| The server reboots | Docker starts everything again, provided Docker starts at boot (`sudo systemctl enable docker`) |

- **What it watches.** `autoheal` restarts containers labelled `autoheal=true`, here `web`.
- **No direct socket access.** Autoheal never gets the Docker socket, since that would amount to
  root on the host. It goes through `docker-proxy`, which only lets it list containers and
  restart one (`deploy/docker-proxy.cfg`) and refuses everything else.
- **Isolation.** The proxy is on an internal network that only autoheal can reach, and neither
  has internet access.
- **Pinned images.** Both images are pinned by digest. To update them, pull the new image and
  update the digest in `compose.yaml`.

```bash
docker compose logs -f web         # Caddy's access and certificate logs
docker compose logs autoheal       # which containers were restarted, and when
```

## Option B: without Docker (Caddy installed on the host)

1. Install Node 20 or newer and Caddy. Copy the project to `/opt/kids-task-tracker` and run
   `npm ci && npm run build` there.
2. Use `deploy/Caddyfile` with `DOMAIN=tasks.example.com` and
   `STATIC_ROOT=/opt/kids-task-tracker/dist`, for example by importing it from
   `/etc/caddy/Caddyfile` and setting the variables in Caddy's systemd unit.

## Option C: a hosting platform or another web server

- **Platforms that run a container** (Fly.io, Railway, Render): build the default `web` target
  and set `DOMAIN=:80`, so Caddy serves plain HTTP and the platform handles HTTPS. Expose
  port 80.
- **Static hosts or an existing web server:** build the files with
  `docker build --target dist -o type=local,dest=out .` (they end up in `out/`), or with
  `npm run build` (in `dist/`). Serve them with the same rules as `deploy/Caddyfile`: HTTPS,
  `index.html` for unknown paths, and `Cache-Control: no-cache` on everything outside
  `/assets/`, above all on `sw.js`.

## Checklist for going live

1. **Serve it over HTTPS.** Without it the app can't be installed and won't work offline.
2. **Never cache `sw.js` long-term**, at any proxy or CDN in front of the app, or installed
   copies stop updating.
3. **Data stays on each device.** Uninstalling the app or clearing the browser's site data
   deletes it, and there's no sync between devices yet.
4. **Rebuild regularly** (`docker compose build --pull`) to pick up Caddy security updates.
