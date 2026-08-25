# Multi-Stage Dockerfile for PrepArsenal Next.js Application
# Optimized for minimal image size, layer caching, and high security.

# ==============================================================================
# 1. Base Image
# ==============================================================================
FROM node:20-alpine AS base
WORKDIR /app

# Install libc6-compat for Alpine compatibility with certain native npm packages
RUN apk add --no-cache libc6-compat curl

# ==============================================================================
# 2. Dependencies Stage
# ==============================================================================
FROM base AS deps
WORKDIR /app

# Copy package manifests for deterministic caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# ==============================================================================
# 3. Build Stage
# ==============================================================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for public environment variables if injected at build time.
# GEMINI_API_KEY / GROQ_API_KEY are intentionally NOT here — they're server-only
# secrets read at request time by app/api/tutor/chat/route.ts, never baked into
# the client bundle. Pass them as runtime container env vars instead.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true

RUN npm run build

# ==============================================================================
# 4. Production Runner Stage
# ==============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-privileged user and group for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone build output
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Native health check for container liveness/readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
