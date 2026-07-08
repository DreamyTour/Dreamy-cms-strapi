# ---------------------------------------------------------
# Stage 1: Build Environment
# ---------------------------------------------------------
FROM node:22-alpine AS build

# Install native dependencies required for better-sqlite3 and sharp
RUN apk update && apk add --no-cache \
    build-base \
    gcc \
    autoconf \
    automake \
    zlib-dev \
    libpng-dev \
    vips-dev \
    python3 \
    > /dev/null 2>&1

WORKDIR /opt/app

# Enable Corepack and prepare pnpm 11
RUN corepack enable && corepack prepare pnpm@latest-11 --activate

# Copy pnpm workspace files first to leverage Docker layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Optional: copy .npmrc if you use pnpm configs, registry, shamefully-hoist, etc.
COPY .npmrc* ./

# Copy the rest of the application before install
# Important for pnpm workspaces, because local workspace packages must exist
COPY . .

# Install all dependencies, including devDependencies required for Strapi build
RUN pnpm install --frozen-lockfile

# Set environment to production before building
ENV NODE_ENV=production

# Build the Strapi application
RUN pnpm run build

# Prune development dependencies to keep the image lightweight
RUN pnpm prune --prod

# ---------------------------------------------------------
# Stage 2: Production Environment
# ---------------------------------------------------------
FROM node:22-alpine

# Install vips-dev as a runtime dependency for sharp
RUN apk add --no-cache vips-dev

WORKDIR /opt/app

# Enable Corepack and prepare pnpm 11
RUN corepack enable && corepack prepare pnpm@latest-11 --activate

# Copy the built app from the build stage
COPY --from=build /opt/app ./

# Ensure local binaries are available
ENV PATH=/opt/app/node_modules/.bin:$PATH

# Runtime environment
ENV NODE_ENV=production

# Create runtime directories before chown so named volume mounts
# inherit node:node ownership on first container start
RUN mkdir -p /opt/app/.tmp /opt/app/public/uploads

# Set permissions for the node user
RUN chown -R node:node /opt/app

# Switch to non-root user
USER node

# Start Strapi
CMD ["pnpm", "run", "start"]