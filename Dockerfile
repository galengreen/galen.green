# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Build arguments for Vite environment variables
ARG VITE_MATOMO_URL
ENV VITE_MATOMO_URL=${VITE_MATOMO_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS runner

# Version label for TrueNAS Apps
ARG VERSION=dev
LABEL org.opencontainers.image.version=${VERSION}

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
