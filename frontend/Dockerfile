# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Pehle dependencies install karein (Cache layer)
# Note: Hum root se run kar rahe hain isliye 'frontend/' prefix use kiya
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Baaki source code copy karein
COPY frontend/ .

# Build banayein
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 2: Runner (Lightweight & Fast)
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# System user banayein security ke liye
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Sirf zaroori files copy karein (Standalone Mode)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# 'npm start' ki jagah direct node chalayenge (Super Fast)
CMD ["node", "server.js"]