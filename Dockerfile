# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy project files
COPY . .

RUN npx prisma generate

ENV SKIP_ENV_VALIDATION=true
ENV NEXT_DISABLE_ESLINT=1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SKIP_TYPE_CHECK=true

# Build Next.js app
RUN npm run build -- --no-lint

# Stage 2: Run the application
FROM node:22-alpine AS runner

WORKDIR /app

# Copy only built files and node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma    

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
