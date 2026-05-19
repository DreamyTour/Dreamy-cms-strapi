# Stage 1: Build Environment
FROM node:22-alpine AS build

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

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

# Copy package.json and lock file to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies required for the build process)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

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

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Install vips-dev as a runtime dependency for sharp
RUN apk add --no-cache vips-dev

WORKDIR /opt/app

# Copy the entire app from the build stage 
# (which now has dev dependencies pruned and dist/ built)
COPY --from=build /opt/app ./

# Ensure the PATH is properly set for global node modules
ENV PATH=/opt/app/node_modules/.bin:$PATH

# Set runtime environment variables
ENV NODE_ENV=production

# Create runtime directories before chown so named volume mounts
# inherit node:node ownership on first container start
RUN mkdir -p /opt/app/.tmp /opt/app/public/uploads

# Set permissions for the node user
RUN chown -R node:node /opt/app

# Switch to standard non-root user
USER node

# Start the application
CMD ["pnpm", "run", "start"]
