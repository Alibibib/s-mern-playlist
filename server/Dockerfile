FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Copy package.json with _moduleAliases configuration
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist

USER appuser

EXPOSE 4000
ENV PORT=4000

CMD ["npm", "start"]
