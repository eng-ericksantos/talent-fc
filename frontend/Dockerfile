# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies separately to leverage Docker layer cache
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and build production bundle
COPY . .
RUN npm run build

# ─── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Copy built Angular/Ionic app
COPY --from=builder /app/www /usr/share/nginx/html

# Copy SPA-aware nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
