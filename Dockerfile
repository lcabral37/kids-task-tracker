# syntax=docker/dockerfile:1
# The app is static: everything is stored on the device (IndexedDB), so there's no API container.
# Targets:
#   web    Caddy serving the built files with HTTPS (default)
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
