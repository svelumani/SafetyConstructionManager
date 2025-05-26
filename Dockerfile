# Use Node.js 20 LTS as base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install required packages for building native dependencies
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files
COPY package*.json ./
# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Make startup script executable
RUN chmod +x docker-start.sh

# Build the application (dev dependencies are already available)
RUN npm run build

# Development image for development environment
FROM base AS development
WORKDIR /app

# Create a non-root user for development
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Make startup script executable
RUN chmod +x docker-start.sh

# Create all necessary directories with proper permissions
RUN mkdir -p uploads/reports uploads/documents uploads/images public/uploads dist/uploads/reports tmp logs && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Default command for development
CMD ["npm", "run", "dev"]

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies for runtime
RUN npm ci --only=production && npm cache clean --force

# Create all necessary directories with proper permissions
RUN mkdir -p uploads/reports uploads/documents uploads/images public/uploads dist/uploads/reports tmp logs && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

USER nextjs

# Expose the port the app runs on
EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "dist/index.js"]