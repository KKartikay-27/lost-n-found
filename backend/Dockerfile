# syntax=docker/dockerfile:1.7

# ───── deps: production dependencies only ─────
FROM node:22.20-alpine3.22 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ───── runtime ─────
FROM node:22.20-alpine3.22 AS runtime
ARG GIT_SHA=unknown
ARG APP_VERSION=dev
ARG BUILD_TIME=unknown
LABEL org.opencontainers.image.source="https://github.com/KKartikay-27/lost-n-found" \
      org.opencontainers.image.title="lostnfound-api" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.version="${APP_VERSION}"

ENV NODE_ENV=production \
    PORT=5050 \
    GIT_SHA=${GIT_SHA} \
    APP_VERSION=${APP_VERSION} \
    BUILD_TIME=${BUILD_TIME}

WORKDIR /app
# Patch OS packages, and drop npm/yarn: the runtime never installs anything,
# and they are the main source of CVEs in the base image.
RUN apk upgrade --no-cache \
 && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
           /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

# The node user (uid 1000) ships with the base image; the app never runs as root.
USER 1000:1000
EXPOSE 5050
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:5050/healthz || exit 1
# node runs as PID 1 directly (not via npm) so SIGTERM reaches the graceful shutdown handler.
CMD ["node", "--import", "./src/tracing.js", "src/server.js"]
