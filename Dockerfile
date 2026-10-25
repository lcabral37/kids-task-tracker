# syntax=docker/dockerfile:1
# The app is static: everything is stored on the device (IndexedDB), so there's no API container.
# Targets:
#   web    Caddy serving the built files over plain HTTP on port 8080 (default); HTTPS comes from
#          whatever sits in front of it (a Cloudflare tunnel)
#   dist   only the built files, to copy to another web server:
#            docker build --target dist -o type=local,dest=out .
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.ts pwa-assets.config.ts tsconfig.json tailwind.config.js postcss.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM scratch AS dist
COPY --from=build /app/dist /

# Last, so it's what a plain `docker build` produces.
FROM caddy:2-alpine AS web
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
# The binary carries cap_net_bind_service for ports below 1024. Port 8080 doesn't need it, and with
# no-new-privileges an unprivileged user isn't allowed to exec a file that grants capabilities.
RUN setcap -r /usr/bin/caddy
# Caddy keeps nothing worth persisting here; pointing its directories at /tmp lets it run as an
# unprivileged user on a read-only filesystem.
ENV XDG_CONFIG_HOME=/tmp/caddy-config \
    XDG_DATA_HOME=/tmp/caddy-data
USER 65534:65534
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/"]
