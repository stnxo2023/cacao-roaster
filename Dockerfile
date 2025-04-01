# Build stage
FROM node:21.6-bullseye-slim AS builder

# Create app directory and set working directory
WORKDIR /build

# Copy package files first to leverage cache
COPY package*.json ./

# Install ALL dependencies (including dev dependencies) for building
ENV CI=true
RUN npm pkg delete scripts.prepare && \
    npm ci --ignore-scripts

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:21.6-bullseye-slim

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --gid 1001 nodeuser

# Copy only necessary files from builder
COPY --from=builder --chown=nodeuser:nodejs /build/package*.json ./
COPY --from=builder --chown=nodeuser:nodejs /build/dist ./dist
COPY --from=builder --chown=nodeuser:nodejs /build/webpack.*.js ./

# Install only production dependencies
ENV NODE_ENV=production
ENV CI=true
RUN npm pkg delete scripts.prepare && \
    npm ci --ignore-scripts --only=production && \
    npm install -g serve@14.2.1

# Switch to non-root user
USER nodeuser

# Expose only necessary port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application using serve for production
CMD ["serve", "-s", "dist", "-l", "3000"]