# ─────────────────────────────────────────────────────────────
# WINGROX BACKEND · PRODUCTION DOCKERFILE
# Multi-stage build for small final image
# ─────────────────────────────────────────────────────────────

# ── Stage 1: Build ───────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifest first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all deps (including dev deps for prisma generate)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source
COPY . .

# ── Stage 2: Production ──────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy generated Prisma client and source from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S wingrox -u 1001 -G nodejs
RUN mkdir -p uploads && chown -R wingrox:nodejs uploads

USER wingrox

EXPOSE 4000

ENV NODE_ENV=production

# On startup: push schema (idempotent), then start server
CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/index.js"]
