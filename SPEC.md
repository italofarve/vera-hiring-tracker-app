# Vera Hiring Tracker — Especificación Técnica

> Documento de transferencia para continuar el desarrollo y despliegue del proyecto en Docker.
> Versión: 1.0 · Fecha: Abril 2026
> Repositorio: [github.com/italofarve/vera-hiring-tracker](https://github.com/italofarve/vera-hiring-tracker)

---

## 1. Descripción funcional

**Vera Hiring Tracker** es una aplicación web para gestionar procesos de selección de talento del Laboratorio 7 de IA Generativa - IE Business School. Tiene tres áreas:

### 1.1 Aplicación HR (privada, requiere login)
Dashboard interno para el equipo de RRHH:
- **Dashboard** — métricas generales, embudo de candidatos, actividad reciente.
- **Posiciones (`/positions`)** — alta, edición y publicación de vacantes.
- **Candidatos (`/candidates`)** — listado, ficha individual, cambio de etapa, subida y análisis de CV con IA.
- **Entrevistas (`/interviews`)** — programación y seguimiento.
- **Feedback (`/feedback`)** — evaluaciones por entrevistador.
- **Help (`/help`)** — guía de uso.

### 1.2 Portal público de candidatos (sin login)
- **`/portal`** — listado de vacantes activas.
- **`/portal/:id`** — formulario de aplicación con subida de CV.

### 1.3 Acceso restringido por allowlist
Solo los emails que aparezcan en una hoja de Google Sheets (lista de alumnos del Laboratorio 7) pueden iniciar sesión y acceder al área HR. Si un email no está en la lista, ve el mensaje:

> "Acceso denegado, sólo los usuarios del Laboratorio 7 de IA Generativa - IE pueden registrarse e iniciar sesión."

con un botón para cerrar sesión. La lista se sincroniza cada 5 minutos desde Google Sheets, con respaldo en CSV local.

### 1.4 Otros artifacts del monorepo (opcionales para producción)
- **vera-pitch-deck** — slides de presentación del producto.
- **vera-video-explainer** — vídeo animado explicativo del flujo.
- **mockup-sandbox** — entorno de prototipado de UI sobre canvas (sólo dev).

Estos tres se pueden excluir del despliegue de producción si no son necesarios.

---

## 2. Stack tecnológico

### 2.1 Runtime y herramientas
| Herramienta | Versión | Notas |
|---|---|---|
| Node.js | 24.x (probado en 24.13.0) | Requerido por `@clerk/express` y ESM modernos |
| pnpm | 10.x (probado en 10.26.1) | Gestor de paquetes obligatorio (`preinstall` rechaza npm/yarn) |
| TypeScript | 5.9.x | Modo estricto |
| PostgreSQL | 14+ | Base de datos principal |

### 2.2 Backend (`artifacts/api-server`)
- **Express 5** — servidor HTTP.
- **Drizzle ORM** — queries y migraciones tipadas (`drizzle-kit`).
- **Zod v4** — validación de entrada/salida (`drizzle-zod` para auto-generar schemas desde DB).
- **@clerk/express** — verificación de JWT de sesión y lookup de usuarios.
- **@replit/connectors-sdk** — proxy autenticado a Google Sheets (sólo Replit).
- **Resend** — envío de emails transaccionales (notificaciones de cambio de etapa, programación de entrevistas).
- **Multer + pdf-parse + mammoth** — subida y extracción de texto de CVs (PDF/DOCX).
- **OpenAI** (vía `@workspace/integrations-openai-ai-server`) — análisis de CV.
- **Pino + pino-http** — logging estructurado.
- **esbuild** — bundling para producción (single-file ESM con `dist/index.mjs`).

### 2.3 Frontend (`artifacts/hiring-tracker`)
- **React 18** + **Vite** — SPA.
- **Wouter** — router minimalista.
- **TanStack Query (React Query)** — estado de servidor.
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives) — sistema de diseño.
- **@clerk/react** — autenticación frontend.
- **react-hook-form + Zod** — formularios.
- **Uppy** — uploader de archivos.
- **Lucide React** — iconografía.
- **date-fns** — manejo de fechas.
- **Recharts** — gráficos del dashboard.

### 2.4 Librerías compartidas (`lib/`)
- `@workspace/db` — schema Drizzle + cliente PostgreSQL.
- `@workspace/api-spec` — OpenAPI 3.1 contrato (`openapi.yaml`).
- `@workspace/api-zod` — schemas Zod generados desde OpenAPI con Orval.
- `@workspace/api-client-react` — hooks React Query generados desde OpenAPI.
- `@workspace/integrations-openai-ai-server` — cliente OpenAI (server-side).
- `@workspace/integrations-openai-ai-react` — cliente OpenAI (client-side).
- `@workspace/object-storage-web` — helpers de Object Storage.

### 2.5 Servicios externos
| Servicio | Propósito | Crítico |
|---|---|---|
| PostgreSQL | Datos persistentes | Sí |
| Clerk | Autenticación de usuarios | Sí |
| Google Sheets API | Fuente del allowlist | No (hay fallback CSV) |
| OpenAI API | Análisis de CV | No (degrada elegantemente) |
| Resend API | Notificaciones por email | No (degrada elegantemente) |
| Object Storage (S3-compatible) | Almacenar CVs | Opcional (actualmente local en Docker) |

---

## 3. Estructura del proyecto

Es un **monorepo pnpm** con artifacts (apps desplegables) y libs (paquetes compartidos):

```
vera-hiring-tracker/
├── pnpm-workspace.yaml          # Discovery de packages + catalog de versiones
├── package.json                 # Scripts raíz (typecheck, build)
├── tsconfig.base.json           # Config TS compartida
├── tsconfig.json                # Solution file (composite refs de libs)
│
├── artifacts/
│   ├── api-server/              # Backend Express
│   ├── hiring-tracker/          # Frontend React HR + portal
│   ├── vera-pitch-deck/         # Slides (opcional)
│   ├── vera-video-explainer/    # Vídeo animado (opcional)
│   └── mockup-sandbox/          # Sandbox dev-only (excluir en prod)
│
├── lib/
│   ├── db/                      # Drizzle schemas + cliente Postgres
│   ├── api-spec/                # openapi.yaml + script de codegen
│   ├── api-zod/                 # Zod schemas generados
│   ├── api-client-react/        # Hooks React Query generados
│   ├── object-storage-web/      # Cliente Object Storage para frontend
│   ├── integrations/
│   ├── integrations-openai-ai-server/
│   └── integrations-openai-ai-react/
│
├── scripts/                     # Utilities CLI (workspace package)
├── docs/                        # Documentación funcional en español
└── SPEC.md                      # Este documento
```

### 3.1 Estructura de `artifacts/api-server/`

```
src/
├── index.ts                     # Entry point: arranca app.listen(PORT)
├── app.ts                       # Configura Express: middlewares, rutas
│
├── routes/
│   ├── index.ts                 # Compone los routers + aplica gate de allowlist
│   ├── health.ts                # GET /healthz (público)
│   ├── portal.ts                # /portal/* (público, candidatos)
│   ├── access.ts                # /access/* (auth Clerk; gate del allowlist)
│   ├── positions.ts             # CRUD de posiciones (gated)
│   ├── candidates.ts            # CRUD de candidatos (gated)
│   ├── interviews.ts            # CRUD de entrevistas (gated)
│   ├── feedback.ts              # CRUD de feedback (gated)
│   ├── dashboard.ts             # Métricas (gated)
│   ├── cv.ts                    # Subida + análisis IA de CV (gated)
│   └── storage.ts               # Object Storage signed URLs
│
├── middlewares/
│   ├── clerkProxyMiddleware.ts  # Proxy de Clerk Frontend API (sólo prod)
│   └── requireAllowedEmail.ts   # Gate del allowlist (401/403)
│
└── lib/
    ├── logger.ts                # Pino singleton (no usar console.log)
    ├── allowedEmails.ts         # Fetch Google Sheets + cache + fallback CSV
    ├── notify.ts                # Cliente Resend (emails transaccionales)
    ├── objectStorage.ts         # Cliente Object Storage
    └── objectAcl.ts             # Helpers de control de acceso a objetos
```

**Build de producción**: `build.mjs` usa esbuild para bundlear todo en `dist/index.mjs` (ESM single-file). Externals incluye paquetes nativos (sharp, pg-native, etc).

### 3.2 Estructura de `artifacts/hiring-tracker/`

```
src/
├── main.tsx                     # ReactDOM.render
├── App.tsx                      # Router + ClerkProvider + AccessGate
├── index.css                    # Tailwind + variables de tema
│
├── pages/
│   ├── Dashboard.tsx            # Vista principal HR
│   ├── Positions.tsx            # Listado posiciones
│   ├── PositionDetail.tsx       # Ficha posición
│   ├── Candidates.tsx           # Listado candidatos
│   ├── CandidateDetail.tsx      # Ficha + CV + análisis IA
│   ├── Interviews.tsx           # Listado y formulario entrevistas
│   ├── Feedback.tsx             # Listado y formulario feedback
│   ├── Help.tsx                 # Guía
│   ├── Portal.tsx               # Listado público de vacantes
│   ├── ApplyPage.tsx            # Formulario público de aplicación
│   └── not-found.tsx            # 404
│
├── components/
│   ├── Layout.tsx               # Sidebar + header con menú usuario
│   ├── AccessGate.tsx           # Comprueba allowlist tras login
│   ├── StageBadge.tsx           # Badge de etapa de candidato
│   ├── StarRating.tsx           # Rating con estrellas
│   └── ui/                      # Componentes shadcn/ui (button, card, dialog, etc.)
│
├── hooks/
│   ├── use-mobile.tsx           # Detección viewport móvil
│   └── use-toast.ts             # Hook de toasts
│
└── lib/
    └── utils.ts                 # cn() + helpers
```

**Build de producción**: Vite genera estáticos en `dist/public/`. Servir con cualquier servidor HTTP que haga rewrite `/* → /index.html`.

### 3.3 Configuración de artifacts (Replit-específico)

Cada artifact tiene `.replit-artifact/artifact.toml` que el proxy de Replit usa para enrutar paths. **En Docker no se usa** — hay que reproducir el routing con un reverse proxy (nginx, Traefik, Caddy):

```
/api/*        → artifacts/api-server (puerto 8080)
/*            → artifacts/hiring-tracker (estáticos)
```

---

## 4. API Endpoints

Base path: `/api`. Todos los endpoints devuelven JSON.

### 4.1 Públicos (sin autenticación)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/healthz` | Health check (`{ status: "ok" }`) |
| GET | `/api/portal/positions` | Lista vacantes abiertas |
| GET | `/api/portal/positions/:id` | Detalle de vacante |
| POST | `/api/portal/apply` | Recibe aplicación (crea candidato) |

### 4.2 Allowlist (requiere sesión Clerk válida)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/access/check` | Devuelve `{ allowed, email }` para el usuario autenticado |
| GET | `/api/access/status` | Metadata de la lista (`{ count, source, loadedAt }`) |
| POST | `/api/access/reload` | Fuerza refresh del cache (requiere estar en allowlist) |

**Nota crítica**: `/access/check` **ignora cualquier query param**. Usa el email verificado por Clerk (`req.auth().userId` → `clerkClient.users.getUser`). Esto evita que un usuario pueda spoofear su identidad.

### 4.3 Protegidos (requiere sesión + email en allowlist)

Aplicado por el middleware `requireAllowedEmail()` en `routes/index.ts`. Sin auth → 401. Con auth pero email no en lista → 403 con `{ error: "not_allowlisted", message: "Acceso denegado..." }`.

#### Posiciones
- `GET /api/positions` — lista
- `POST /api/positions` — crea
- `GET /api/positions/:id` — detalle
- `PATCH /api/positions/:id` — actualiza
- `DELETE /api/positions/:id` — borra

#### Candidatos
- `GET /api/candidates` — lista (acepta query `?positionId=&stage=`)
- `POST /api/candidates` — crea
- `GET /api/candidates/:id` — detalle
- `PATCH /api/candidates/:id` — actualiza (cambio de etapa dispara email)
- `DELETE /api/candidates/:id` — borra

#### CVs (asociados a candidatos)
- `POST /api/candidates/:id/cv` — sube archivo (multipart)
- `GET /api/candidates/:id/cv-text` — texto extraído
- `POST /api/candidates/:id/analyze-cv` — análisis con OpenAI
- `GET /api/candidates/:id/cv-analysis` — resultado del análisis

#### Entrevistas
- `GET /api/interviews` — lista (acepta `?candidateId=`)
- `POST /api/interviews` — crea (programación dispara email)
- `GET /api/interviews/:id` — detalle
- `PATCH /api/interviews/:id` — actualiza
- `DELETE /api/interviews/:id` — borra

#### Feedback
- `GET /api/feedback` — lista (acepta `?candidateId=&interviewId=`)
- `POST /api/feedback` — crea
- `PATCH /api/feedback/:id` — actualiza
- `DELETE /api/feedback/:id` — borra

#### Dashboard
- `GET /api/dashboard/summary` — KPIs (total candidatos, abiertos, etc.)
- `GET /api/dashboard/pipeline` — distribución por etapa
- `GET /api/dashboard/recent-activity` — últimas N actividades

#### Storage
- `POST /api/storage/uploads/request-url` — firma URL de subida
- `GET /api/storage/public-objects/*filePath` — sirve público
- `GET /api/storage/objects/*path` — sirve privado (con auth)

### 4.4 Contrato OpenAPI

`lib/api-spec/openapi.yaml` es la **fuente única de verdad** del contrato. Para regenerar Zod schemas y hooks React Query:

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## 5. Variables de entorno

### 5.1 Obligatorias

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Connection string Postgres | `postgres://user:pass@host:5432/db` |
| `PORT` | Puerto del servidor (api-server y frontend usan distintos) | `8080` (api), `19554` (web) |
| `BASE_PATH` | Base path del frontend (Vite) | `/` |
| `CLERK_SECRET_KEY` | Secret key de Clerk (server) | `sk_test_...` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Publishable key de Clerk (build-time del frontend) | `pk_test_...` |
| `SESSION_SECRET` | Secret para firmar cookies | string aleatorio largo |

### 5.2 Opcionales con efecto

| Variable | Default | Descripción |
|---|---|---|
| `NODE_ENV` | `development` | `production` activa el proxy Clerk y el logger JSON |
| `LOG_LEVEL` | `info` | nivel de Pino |
| `RESEND_API_KEY` | _vacío_ | Sin esto los emails no se envían (no rompe nada) |
| `NOTIFY_FROM_EMAIL` | `hiring@vera.example.com` | Remitente de notificaciones |
| `ALLOWED_EMAILS_SHEET_ID` | `1V_IHJn3ZAyVMdJo9oX3skYt2xunid37naSRN3_L2ohs` | ID de la Google Sheet |
| `ALLOWED_EMAILS_SHEET_NAME` | `lista de alumnos` | Pestaña dentro de la sheet |
| `ALLOWED_EMAILS_COLUMN_HEADER` | `email` | Header de la columna de emails |
| `OPENAI_API_KEY` | _vacío_ | Sin esto, `/analyze-cv` falla |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | _vacío_ | ID del bucket S3-compatible |
| `PRIVATE_OBJECT_DIR` | _vacío_ | Prefijo de objetos privados en bucket |
| `PUBLIC_OBJECT_SEARCH_PATHS` | _vacío_ | Prefijos de búsqueda de objetos públicos |
| `VITE_CLERK_PROXY_URL` | _vacío_ | URL pública del proxy Clerk (sólo prod con dominio propio) |

### 5.3 Específicas de Replit (no aplicar en Docker)

- `REPL_ID`, `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS` — usadas por plugins de dev y proxy.
- El conector de Google Sheets vive en la infraestructura de Replit; en Docker no se usa (se cae al CSV).

---

## 6. Modelo de datos (PostgreSQL)

Schemas Drizzle en `lib/db/src/schema/`. Todos los IDs son `serial` (autoincremental). Todas las tablas tienen `created_at` con timezone.

### 6.1 `positions`
| Columna | Tipo | Notas |
|---|---|---|
| id | serial PK | |
| title | text NOT NULL | |
| department | text NOT NULL | |
| location | text NOT NULL | |
| type | text NOT NULL | default `full-time` |
| status | text NOT NULL | default `open` |
| description | text | |
| headcount | integer NOT NULL | default 1 |
| created_at, updated_at | timestamptz NOT NULL | |

### 6.2 `candidates`
| Columna | Tipo | Notas |
|---|---|---|
| id | serial PK | |
| first_name, last_name | text NOT NULL | |
| email | text NOT NULL | |
| phone | text | |
| position_id | integer | FK lógica → positions.id |
| stage | text NOT NULL | default `applied` (etapas: applied, screening, interview, offer, hired, rejected) |
| status | text NOT NULL | default `active` |
| source | text | de dónde vino el candidato |
| resume_url | text | URL externa |
| cv_path | text | ruta en object storage |
| cv_analysis | text | JSON serializado del análisis OpenAI |
| notes | text | |
| rating | integer | |
| created_at, updated_at | timestamptz | |

### 6.3 `interviews`
| Columna | Tipo |
|---|---|
| id | serial PK |
| candidate_id | integer NOT NULL |
| type | text NOT NULL |
| scheduled_at | timestamptz |
| duration_minutes | integer |
| interviewer_name, interviewer_email | text |
| location, meeting_url | text |
| status | text NOT NULL (default `scheduled`) |
| notes | text |
| created_at | timestamptz |

### 6.4 `feedback`
| Columna | Tipo |
|---|---|
| id | serial PK |
| interview_id, candidate_id | integer NOT NULL |
| reviewer_name | text NOT NULL |
| reviewer_email | text |
| rating | integer NOT NULL |
| technical_score, cultural_score, communication_score | integer |
| strengths, weaknesses | text |
| recommendation | text NOT NULL |
| notes | text |
| created_at | timestamptz |

### 6.5 `activity`
| Columna | Tipo |
|---|---|
| id | serial PK |
| type | text NOT NULL |
| description | text NOT NULL |
| candidate_name, position_title | text |
| timestamp | timestamptz |

### 6.6 `conversations`, `messages`
Tablas no usadas actualmente por el frontend; vienen del scaffold. Se pueden eliminar si no se planea construir un módulo de chat.

### 6.7 Migraciones
- Schema definido en código (Drizzle).
- Para sincronizar: `pnpm --filter @workspace/db run push` (usa `drizzle-kit push`).
- Para producción se recomienda generar migraciones SQL versionadas (`drizzle-kit generate`) y aplicarlas en el pipeline.

---

## 7. Flujo de autenticación y allowlist (en detalle)

```
┌───────────────────────────────────────────────────────────────────────┐
│  Usuario abre la app (cualquier ruta HR)                              │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
            <Show when="signed-out"> → <RedirectToSignIn />
            <Show when="signed-in">  → <AccessGate>
                                            │
                ┌───────────────────────────┼───────────────────────────┐
                ▼                                                       
        Llama a GET /api/access/check con Bearer token de Clerk
                ▼
        Backend: getAuth(req) → userId
                ▼
        clerkClient.users.getUser(userId) → email primario
                ▼
        isEmailAllowed(email):
          1. Cache en memoria (TTL 5 min) → si fresh, devuelve
          2. Si no, fetch a Google Sheets vía @replit/connectors-sdk
          3. Si falla, lee data/allowed-emails.csv
          4. Si CSV vacío también → fail-closed (deny)
                ▼
        ┌──────────┴──────────┐
        ▼                     ▼
    allowed: true          allowed: false
        │                     │
        ▼                     ▼
    Renderiza           Muestra "Acceso denegado..." + botón Cerrar sesión
    children
```

**Cache de email→userId**: el middleware `requireAllowedEmail` cachea `userId → email` durante 10 minutos para evitar hacer un lookup a Clerk en cada request a la API.

**Defensa en profundidad**:
- Frontend: AccessGate bloquea la UI.
- Backend: `requireAllowedEmail()` aplicado a todos los routers de negocio en `routes/index.ts`. Aunque alguien intente llamar la API directamente, recibirá 401/403.

**Lo que NO hace** (decisión consciente):
- No bloquea el sign-up en Clerk. Cualquiera con email válido puede crear cuenta en Clerk; la app le bloquea inmediatamente con el mensaje. Para bloquear pre-Clerk haría falta un webhook de Clerk + API de gestión.

---

## 8. Limitaciones conocidas y atajos tomados

### 8.1 Específicos del entorno Replit

| Atajo | Por qué | Mitigación en Docker |
|---|---|---|
| Conector Google Sheets vía `@replit/connectors-sdk` | Replit gestiona OAuth y refresh de tokens automáticamente | Migrar a `googleapis` con Service Account; o desactivar conector y vivir del CSV (recargar con `POST /api/access/reload` o reinicio) |
| Proxy Clerk en `/api/__clerk` (`clerkProxyMiddleware.ts`) | Permite Clerk en dominios sin CNAME | En Docker con dominio propio, configurar CNAME directo en Clerk Dashboard y eliminar el proxy |
| Routing por path con proxy Replit | `/api/*` → api-server, `/*` → frontend, sin tocar config | Reverse proxy (nginx/Traefik/Caddy) con las mismas reglas |
| Object Storage vía Replit | Cliente apunta a buckets gestionados por Replit | Usar S3, GCS, MinIO; cambiar credenciales en `objectStorage.ts` |
| `@replit/vite-plugin-*` (cartographer, dev-banner, runtime-error-modal) | Devtools de Replit | Eliminar del `vite.config.ts` para builds de producción (no rompen, solo añaden peso si quedan) |

### 8.2 Decisiones de diseño con trade-offs

1. **Sin migraciones versionadas**. Se usa `drizzle-kit push` (sincroniza schema directo). Para producción: generar y commitear migraciones SQL.
2. **El CSV de allowlist está en `.gitignore`**. Si despliegas en Docker desde el repo, el contenedor arranca sin la lista. Soluciones:
   - Montar volumen con el CSV: `-v /host/allowed-emails.csv:/app/artifacts/api-server/data/allowed-emails.csv`
   - Inyectar el CSV via build-time o env var
   - Confiar 100% en Google Sheets (pero entonces necesitas credenciales propias)
3. **`cv_analysis` se guarda como `text`** (JSON serializado). Para queries sobre campos del análisis, migrar a `jsonb`.
4. **Sin paginación** en endpoints `GET /candidates`, `/positions`, etc. Con >1000 registros habrá que añadirla.
5. **Sin tests automatizados**. La validación se hizo manualmente y con un revisor de código IA. Antes de producción seria, añadir tests con Vitest + Playwright.
6. **Sign-up de Clerk no está restringido**. Cualquiera puede crear cuenta; el bloqueo es post-login. Para restringir pre-creación: webhook de Clerk + lookup contra allowlist + delete user.
7. **`vera-pitch-deck`, `vera-video-explainer`, `mockup-sandbox`** son artifacts de presentación/dev. Se pueden eliminar del despliegue de producción (excluir del Dockerfile o eliminar del workspace).
8. **El email primario de Clerk** se asume verificado. Si el usuario tiene varios emails, se usa `primaryEmailAddressId`.
9. **Logs**: usar `req.log` en handlers y `logger` (singleton) en código no-request. **Nunca** `console.log` en backend.

### 8.4 Migración fuera de Replit en detalle (lectura obligatoria antes del Docker)

Esta sección expande los tres puntos críticos de la sección 8.1 con sus opciones, trade-offs y la decisión por defecto que toma el `Dockerfile` en `docker/`.

#### A) Conector de Google Sheets

**Cómo funciona en Replit**: la app pide credenciales al SDK `@replit/connectors-sdk`. Replit guarda el OAuth, refresca tokens automáticamente y los entrega a la app cada vez que los necesita. Cero configuración manual, pero **sólo existe dentro del workspace de Replit**.

**Por qué se rompe en Docker**: en un contenedor en tu propio servidor no hay infraestructura de Replit que entregue tokens. El SDK fallará y caerá al fallback CSV.

**Las tres opciones**:

| Opción | Esfuerzo | Pros | Contras |
|---|---|---|---|
| **A. Sólo CSV** | Mínimo | Cero dependencias externas, cero credenciales que rotar | Hay que actualizar el archivo manualmente y llamar `/api/access/reload` o reiniciar |
| **B. Service Account de Google** | Medio | Sigue siendo "live" desde la hoja | Crear cuenta de servicio en Google Cloud, gestionar JSON de credenciales, reescribir `lib/allowedEmails.ts` con `googleapis` |
| **C. Sincronizar a tabla Postgres** | Alto | API muy rápida, auditoría, funciona aunque Google Sheets esté caído, permite roles/expiración | Servicio extra (cron sincronizador), sigue necesitando Service Account |

**Decisión por defecto del Docker**: **Opción A (CSV)**. El contenedor monta `allowed-emails.csv` como volumen. Para añadir/quitar a alguien: editar el CSV y llamar a `POST /api/access/reload` o reiniciar el contenedor `api`. El código de `lib/allowedEmails.ts` ya tiene el fallback implementado, **no requiere cambios**.

#### B) Plugins de Vite específicos de Replit

**Cómo funcionan ahora**: en `artifacts/hiring-tracker/vite.config.ts` se importan tres plugins:
- `@replit/vite-plugin-cartographer` — diagramas de código en el editor de Replit.
- `@replit/vite-plugin-dev-banner` — banderita "Open in Replit" arriba de la app.
- `@replit/vite-plugin-runtime-error-modal` — modal para errores de runtime con integración con el agente.

**Estado en Docker (sin tocar código)**:
- `cartographer` y `dev-banner` están protegidos por `if (NODE_ENV !== "production" && REPL_ID !== undefined)`. En Docker `NODE_ENV=production` y no hay `REPL_ID`, así que **no se cargan**. Bien.
- `runtimeErrorOverlay()` se carga **siempre**. En producción no muestra el modal (sólo se activa con errores en dev), así que es un componente inerte. Coste: ~20kB de bundle. Aceptable.

**Decisión por defecto del Docker**: **dejar los tres en el `package.json`** y dejar que Vite los instale en el build. El paquete `runtimeErrorOverlay` es público en npm y se instala sin problema. Cuando quieras hacer limpieza definitiva (tras consolidar en Cursor):
1. Eliminar las tres líneas `@replit/vite-plugin-*` del `artifacts/hiring-tracker/package.json`.
2. Eliminar el `import runtimeErrorOverlay` y la línea `runtimeErrorOverlay()` de `vite.config.ts`.
3. Eliminar el bloque `await import("@replit/vite-plugin-cartographer")` y `await import("@replit/vite-plugin-dev-banner")`.

#### C) Proxy de Clerk

**Cómo funciona ahora**: Clerk requiere un subdominio (`clerk.tu-dominio.com`) con un `CNAME` apuntando a sus servidores. En Replit no controlas el DNS, así que el SDK monta una ruta `/api/__clerk/*` que actúa como **intermediario**: el navegador habla con tu propia API y ésta reenvía a Clerk. Es el archivo `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts`.

**En Docker con dominio propio**:
1. En el dashboard de Clerk → Domains → añadir `vera.tudominio.com` como dominio de producción.
2. Clerk te dará un `CNAME` (algo tipo `clerk.vera.tudominio.com → frontend-api.clerk.services`).
3. Crear ese registro en tu proveedor DNS (Cloudflare, etc.) y esperar propagación.
4. En las variables de entorno del contenedor `web`, **dejar `VITE_CLERK_PROXY_URL` vacía**. El frontend hablará directamente con Clerk.
5. El middleware `clerkProxyMiddleware` quedará montado pero **nunca recibirá requests** (código muerto inofensivo).

**Si quieres prescindir del CNAME**: deja `VITE_CLERK_PROXY_URL=https://vera.tudominio.com/api/__clerk` y el proxy seguirá funcionando. Funciona, pero cada login añade un salto extra a través de tu servidor.

**Decisión por defecto del Docker**: configuración con CNAME (sin proxy). El `docker-compose.yml` no setea `VITE_CLERK_PROXY_URL`. Verás un comentario en `docker/README.md` recordando los pasos del CNAME.

#### Resumen de decisiones aplicadas en `docker/`

| Pieza | Decisión | Requiere acción manual |
|---|---|---|
| Google Sheets | Sólo CSV (volumen) | Sí: copiar `allowed-emails.csv` al servidor |
| Plugins Vite | Se quedan instalados (inertes en prod) | No |
| Proxy Clerk | Eliminado (vía variable vacía) | Sí: configurar CNAME en DNS y dashboard de Clerk |
| Object Storage | Volumen local | Sí: si quieres S3, ajustar `objectStorage.ts` |
| Reverse proxy | Caddy (HTTPS automático) | Sí: apuntar dominio al servidor |

### 8.3 Pendientes funcionales (backlog)

- Webhooks Clerk para sincronizar usuarios eliminados.
- Auditoría: tabla `audit_log` con `user_email + action + entity + before/after`.
- Roles dentro del allowlist (admin, recruiter, viewer) — ahora cualquiera de la lista tiene acceso total.
- Filtros y paginación en listados.
- Búsqueda full-text en candidatos.
- Reset/recuperación de contraseña (vive en Clerk, ya disponible).
- Internacionalización (la UI mezcla inglés y español).

---

## 9. Cómo arrancar localmente (sin Replit)

```bash
# 1. Requisitos: Node 24+, pnpm 10+, PostgreSQL en marcha

# 2. Variables de entorno (crear .env en la raíz)
cat > .env << 'EOF'
DATABASE_URL=postgres://user:pass@localhost:5432/vera
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
SESSION_SECRET=$(openssl rand -hex 32)
RESEND_API_KEY=re_...           # opcional
EOF

# 3. Instalar deps
pnpm install

# 4. Migrar DB
pnpm --filter @workspace/db run push

# 5. Build de libs (necesario antes de arrancar artifacts)
pnpm run typecheck:libs

# 6. Arrancar backend
PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server run dev

# 7. En otra terminal, arrancar frontend
PORT=19554 BASE_PATH=/ pnpm --filter @workspace/hiring-tracker run dev

# 8. Configurar reverse proxy local (ej: nginx)
# /api/* → http://localhost:8080
# /*     → http://localhost:19554
```

---

## 10. Recomendaciones para Docker

### 10.1 Arquitectura sugerida

```
┌─────────────────────────────────────────────────────┐
│ Reverse proxy (nginx / Traefik / Caddy)             │
│   /api/* → api-server:8080                          │
│   /*     → estáticos servidos por nginx o web:80    │
└──────────────────┬───────────────────┬──────────────┘
                   │                   │
                   ▼                   ▼
        ┌─────────────────┐   ┌──────────────────┐
        │ api-server      │   │ web (estático)   │
        │ Node 24 ESM     │   │ nginx + dist/    │
        │ Puerto 8080     │   │ Puerto 80        │
        └────────┬────────┘   └──────────────────┘
                 │
                 ▼
        ┌─────────────────────────────────┐
        │ PostgreSQL (managed o container)│
        └─────────────────────────────────┘
```

### 10.2 Esqueleto de Dockerfile multi-stage

```dockerfile
# ---- builder ----
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY tsconfig*.json ./
COPY artifacts/ ./artifacts/
COPY lib/ ./lib/
COPY scripts/ ./scripts/
RUN pnpm install --frozen-lockfile
RUN pnpm run typecheck:libs
RUN pnpm --filter @workspace/api-server run build
RUN pnpm --filter @workspace/hiring-tracker run build

# ---- api-server runtime ----
FROM node:24-alpine AS api
WORKDIR /app
COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/api-server/data ./data  # CSV fallback
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node", "--enable-source-maps", "dist/index.mjs"]

# ---- web runtime ----
FROM nginx:alpine AS web
COPY --from=builder /app/artifacts/hiring-tracker/dist/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 10.3 docker-compose.yml mínimo

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: vera
    volumes:
      - db-data:/var/lib/postgresql/data

  api:
    build:
      context: .
      target: api
    environment:
      DATABASE_URL: postgres://postgres:secret@db:5432/vera
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
      SESSION_SECRET: ${SESSION_SECRET}
      RESEND_API_KEY: ${RESEND_API_KEY}
    volumes:
      # Permite editar la lista en caliente sin rebuild
      - ./allowed-emails.csv:/app/data/allowed-emails.csv:ro
    depends_on: [db]

  web:
    build:
      context: .
      target: web
    depends_on: [api]

  proxy:
    image: caddy:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
    depends_on: [api, web]

volumes:
  db-data:
```

### 10.4 Caddyfile mínimo

```
example.com {
  handle /api/* {
    reverse_proxy api:8080
  }
  handle {
    reverse_proxy web:80
  }
}
```

### 10.5 Cosas a quitar/ajustar antes del Dockerfile

1. **Eliminar plugins de Replit** del `vite.config.ts` y `package.json` del frontend:
   - `@replit/vite-plugin-cartographer`
   - `@replit/vite-plugin-dev-banner`
   - `@replit/vite-plugin-runtime-error-modal`
2. **Eliminar el proxy Clerk** (`clerkProxyMiddleware`) o configurar `VITE_CLERK_PROXY_URL` apropiadamente para tu dominio.
3. **Decidir el origen del allowlist**:
   - **Opción A** (más simple): vivir del CSV. Edita `allowed-emails.csv` y reinicia/llama `/access/reload`.
   - **Opción B**: migrar `lib/allowedEmails.ts` para usar Service Account de Google directamente con `googleapis`, en lugar del SDK de Replit.
4. **Eliminar artifacts no necesarios** (pitch-deck, video-explainer, mockup-sandbox) del Dockerfile builder para reducir tamaño y tiempo de build.
5. **Object Storage**: si usas S3/MinIO, ajustar `lib/objectStorage.ts`. Si no usas storage externo, los CVs se romperán; alternativa rápida: guardar en volumen local.
6. **Generar migraciones SQL versionadas** con `drizzle-kit generate` y aplicarlas en el contenedor api antes de `npm start`, o como init container.

---

## 11. Checklist de migración

- [x] Repo publicado en GitHub (historial limpio para la fase local post-Replit).
- [ ] Crear `allowed-emails.csv` de entorno (archivo real fuera de Git; montar por volumen en Docker).
- [ ] Revisar `.env.example` y crear `.env` real.
- [ ] Instalar dependencias: `pnpm install`.
- [ ] Crear DB Postgres y aplicar schema: `pnpm --filter @workspace/db run push`.
- [ ] Quitar plugins de Replit del Vite config.
- [ ] Decidir estrategia para Google Sheets (SDK Replit vs Service Account vs solo CSV).
- [ ] Configurar Clerk (dominio, redirect URLs).
- [ ] Configurar reverse proxy (nginx/Caddy/Traefik).
- [ ] Construir Dockerfile multi-stage.
- [ ] Configurar Object Storage (o volumen local).
- [ ] Configurar Resend (o desactivar envío de emails).
- [ ] Probar flujo: login con email permitido → acceso, login con email no permitido → mensaje de denegación.
- [ ] Probar flujo: postular en `/portal` sin login → debe funcionar.
- [ ] Configurar backups de la DB.
- [ ] Configurar logs centralizados (Pino → stdout → recolector).
- [ ] CI: typecheck + build + tests (cuando existan).

---

## 12. Contacto y referencias

- **Repo**: actualizar con la URL del repositorio actual publicado desde esta refactorizacion
- **OpenAPI**: `lib/api-spec/openapi.yaml`
- **Schema DB**: `lib/db/src/schema/`
- **Mensajería i18n**: el mensaje de denegación está hardcodeado en `artifacts/api-server/src/middlewares/requireAllowedEmail.ts` y `artifacts/hiring-tracker/src/components/AccessGate.tsx` (constante `DENIED_MESSAGE`).
- **Documentación interna en español**: `docs/vera-prompts-resumen.md`, `docs/guia-iteracion-replit.md`.
