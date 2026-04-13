# Build stage for frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY postcss.config.js tailwind.config.js ./
COPY src ./src
COPY public ./public
RUN npm ci && npm run build

# Build stage for backend
FROM node:20-alpine AS backend-builder
WORKDIR /api
COPY server/package*.json ./
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm ci && npm run build

# Final stage - runtime
FROM node:20-alpine
WORKDIR /home/app

# Install nginx for reverse proxy
RUN apk add --no-cache nginx

# Copy built frontend
COPY --from=frontend-builder /app/dist ./public

# Copy built backend
RUN mkdir -p ./api
COPY --from=backend-builder /api/dist ./api/dist
COPY --from=backend-builder /api/node_modules ./api/node_modules

# Copy backend package.json for reference
COPY server/package.json ./api/package.json

# Create database directory
RUN mkdir -p ./data

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start nginx and backend
CMD ["sh", "-c", "nginx && cd /home/app/api && node dist/server.js"]
