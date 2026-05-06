FROM node:20-slim AS base
RUN npm install -g npm@latest

FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/worker/package*.json ./apps/worker/
RUN npm install --workspaces --if-present

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/worker

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Chromium + fonts for Remotion rendering
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto \
    libgbm1 \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libasound2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV REMOTION_CHROME_EXECUTABLE=/usr/bin/chromium
# En producción, apuntar al JS compilado de la composición
ENV REMOTION_ENTRY_POINT=/app/dist/remotion/index.js

COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3002
CMD ["node", "dist/index.js"]
