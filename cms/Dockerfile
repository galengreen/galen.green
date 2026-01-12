# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Payload importmap (required before build)
ARG MONGODB_URI=mongodb://localhost:27017/build
ARG PAYLOAD_SECRET=build-time-secret
ENV MONGODB_URI=${MONGODB_URI}
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}

RUN npm run generate:importmap

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

# Version label for TrueNAS Apps
ARG VERSION=dev
LABEL org.opencontainers.image.version=${VERSION}

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 payload

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create media directory
RUN mkdir -p /app/media && chown -R payload:nodejs /app/media

USER payload

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
