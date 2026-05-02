# =============================================================================
# Vera Hiring Tracker — Dockerfile multi-stage
#
# Targets:
#   - api : runtime del backend Express (puerto 8080)
#   - web : runtime estático del frontend React (nginx, puerto 80)
#
# Build context: el directorio raíz del repo (NO el directorio docker/)
# Uso desde docker/docker-compose.yml: build.context = ".."
# =============================================================================

ARG NODE_VERSION=24-alpine

# -----------------------------------------------------------------------------
# Stage: deps
# Instala dependencias del workspace. Cacheable cuando los package.json no cambian.
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# Metadatos del workspace primero para mejor caché de capas
COPY pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json tsconfig.json ./

# Copiar TODOS los package.json (sin código fuente) para resolver el grafo de deps
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/hiring-tracker/package.json ./artifacts/hiring-tracker/
COPY scripts/package.json ./scripts/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/db/package.json ./lib/db/
COPY lib/object-storage-web/package.json ./lib/object-storage-web/
COPY lib/integrations-openai-ai-server/package.json ./lib/integrations-openai-ai-server/
COPY lib/integrations-openai-ai-react/package.json ./lib/integrations-openai-ai-react/

# Sin lockfile estricto: Replit no commitea pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile

# -----------------------------------------------------------------------------
# Stage: builder
# Compila libs (TS composite), bundle del api-server (esbuild) y build de Vite.
# -----------------------------------------------------------------------------
FROM deps AS builder
WORKDIR /app

# Código fuente
COPY lib ./lib
COPY artifacts/api-server ./artifacts/api-server
COPY artifacts/hiring-tracker ./artifacts/hiring-tracker
COPY scripts ./scripts

# Build api-server → artifacts/api-server/dist/index.mjs
RUN pnpm --filter @workspace/api-server run build

# Build frontend → artifacts/hiring-tracker/dist/public/
# Vite necesita VITE_CLERK_PUBLISHABLE_KEY en build time (se hornea en el bundle)
ARG VITE_CLERK_PUBLISHABLE_KEY=""
ENV NODE_ENV=production
ENV PORT=80
ENV BASE_PATH=/
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
RUN pnpm --filter @workspace/hiring-tracker run build

# -----------------------------------------------------------------------------
# Stage: api (RUNTIME del backend)
# Incluye node_modules completos porque esbuild externaliza pdf-parse, mammoth, etc.
# Al arrancar: aplica schema con drizzle-kit y luego lanza el server.
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS api
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# OCR fallback dependencies for image-based PDFs (optional, controlled by env flags)
# IMPORTANT: install language data package explicitly (eng.traineddata).
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng poppler-utils

COPY --from=builder /app /app

# Directorio para el CSV de allowlist (se monta como volumen en compose)
RUN mkdir -p /app/artifacts/api-server/data

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Migración de schema + arranque del server
# IMPORTANTE: drizzle-kit push aplica los cambios del schema TS a la DB.
# Para producción real se recomienda generar y aplicar migraciones SQL versionadas.
CMD ["sh", "-c", "pnpm --filter @workspace/db run push-force && node --enable-source-maps artifacts/api-server/dist/index.mjs"]

# -----------------------------------------------------------------------------
# Stage: web (RUNTIME del frontend)
# nginx sirviendo los estáticos del build de Vite con fallback a index.html.
# -----------------------------------------------------------------------------
FROM nginx:alpine AS web

COPY --from=builder /app/artifacts/hiring-tracker/dist/public /usr/share/nginx/html
COPY docker/nginx-web.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
