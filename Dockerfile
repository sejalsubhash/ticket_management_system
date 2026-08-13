# =========================
# 1. Build React frontend
# =========================
FROM node:20-alpine AS client-build

WORKDIR /client

# Copy package files first for better Docker caching
COPY client/package*.json ./

RUN npm ci

# Copy frontend source
COPY client/ ./

# Build React/Vite application
RUN npm run build


# =========================
# 2. Production backend
# =========================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy backend package files
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy backend source
COPY server/ ./

# Create uploads directory
RUN mkdir -p uploads

# Copy React production build
COPY --from=client-build /client/dist ./client/dist

# Render provides the PORT environment variable
EXPOSE 10000

# Start Node/Express server
CMD ["node", "src/app.js"]
