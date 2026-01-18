# ========================
# STAGE 1: Build
# ========================
FROM node:20-alpine AS builder
WORKDIR /app

# Configure npm for better network reliability
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 120000

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm ci --legacy-peer-deps || npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ========================
# STAGE 2: Production with Nginx
# ========================
FROM nginx:alpine AS runner

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
