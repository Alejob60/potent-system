# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install dependencies including devDependencies for build
RUN npm ci --legacy-peer-deps

COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=3007

EXPOSE 3007

CMD ["node", "dist/main"]