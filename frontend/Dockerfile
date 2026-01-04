# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend application code
COPY frontend/ .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner    

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built assets from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]