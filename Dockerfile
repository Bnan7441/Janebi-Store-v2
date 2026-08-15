FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

COPY package*.json tsconfig.json vite.config.ts drizzle.config.ts ./
RUN npm ci

COPY . .

# Build frontend and compile server
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache python3 make g++ sqlite

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
