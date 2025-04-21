FROM node:18-alpine AS base

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ gcc sqlite-dev tini

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
FROM base AS dependencies
ENV NODE_OPTIONS="--dns-result-order=ipv4first"
RUN yarn install --frozen-lockfile

# Build the app
FROM dependencies AS builder
COPY . .
# Load environment variables for build time
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
RUN yarn build

# Production image
FROM base AS runner
ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY docker-entrypoint.sh ./

# Create volume mount points
VOLUME ["/app/data"]

# Set up environment to use mapped sqlite.db
ENV SQLITE_DB_PATH=/app/data/sqlite.db

# User to run the app (for security)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN chown -R nodejs:nodejs /app
RUN chmod +x /app/docker-entrypoint.sh
USER nodejs

# Create a directory for the .env file
RUN mkdir -p /app/config
# This directory will be mounted from host

# Expose the port
EXPOSE 3000

# Use tini as init process to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start the app with our custom entrypoint script
CMD ["/app/docker-entrypoint.sh"]
