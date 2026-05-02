# Vera Hiring Tracker - Estado de Dockerizacion (2026-05-01)

## Objetivo de la sesion

Dejar el proyecto ejecutando en local con Docker, validar login + allowlist + modulos principales, restaurar datos, y desbloquear la subida de CV sin dependencias de Replit.

## Estado actual

- Stack Docker probado y funcional en `https://localhost`:
  - `db` (PostgreSQL)
  - `api` (Express)
  - `web` (nginx + frontend)
  - `proxy` (Caddy)
- Login y control por allowlist funcionando.
- Dashboard y modulos principales funcionando.
- Datos restaurados desde backup SQL.
- Analisis de CV por texto con OpenAI funcionando.
- Subida/lectura de CV funcionando con almacenamiento local Docker.
- Repositorio publicado en GitHub desde una base local limpia (sin arrastrar historial previo de prototipo).

## Cambios realizados (resumen)

### Docker / infraestructura

- Ajustes en `docker/docker-compose.yml` para:
  - corregir sintaxis de `DOMAIN`
  - mapear variables de Clerk en backend (`CLERK_PUBLISHABLE_KEY`)
  - mapear variables OpenAI de integracion:
    - `AI_INTEGRATIONS_OPENAI_API_KEY`
    - `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - habilitar provider local para CV:
    - `CV_STORAGE_PROVIDER=local`
    - `LOCAL_CV_STORAGE_DIR=/app/uploads`
- Ajustes en `docker/Dockerfile` para que build funcione fuera de Replit.
- Ajuste en `.dockerignore` para permitir `docker/nginx-web.conf`.
- Ajustes en `.gitignore` para proteger secretos:
  - `docker/.env`
  - `.env`, `.env.*`
  - mantener `*.env.example` trackeados.

### Frontend

- Correccion del error en blanco de `localhost`:
  - fix de arbol de providers React Query/Clerk en `artifacts/hiring-tracker/src/App.tsx`
  - dedupe de `@tanstack/react-query` en `artifacts/hiring-tracker/vite.config.ts`
- Ajuste de `AccessGate` para evitar ciclo de re-verificacion en algunas sesiones Clerk.

### Backend CV

- `artifacts/api-server/src/routes/cv.ts` actualizado para soportar almacenamiento local cuando:
  - `CV_STORAGE_PROVIDER=local`
- En modo local:
  - guarda archivos en `LOCAL_CV_STORAGE_DIR` (default `/app/uploads`)
  - persiste referencia `local://...`
  - lee archivo local para `cv-text` y analisis posterior.

### Datos

- Backup recibido y restaurado:
  - `backups/vera-backup-20260501-161642.tar.gz`
  - SQL restaurado: `vera-db-20260501-161613.sql`
- Conteos validados tras restauracion:
  - `positions`: 5
  - `candidates`: 10
  - `interviews`: 5
  - `feedback`: 2
- Allowlist CSV actualizado desde backup:
  - `docker/allowed-emails.csv`

## Nota importante

- Se ejecuto `docker compose down -v` durante troubleshooting.
- Eso borro volumenes locales de Docker (incluyendo DB local de ese momento), NO borro datos del repo ni de Replit.

## Roadmap acordado (siguiente sesion)

> Roadmap vivo actualizado en: `docs/roadmap.md`

1. Validacion funcional final de CV upload + extraction + AI en varios casos (PDF, DOCX).
2. Decidir estrategia futura de storage:
   - mantener local para dev
   - migrar a MinIO o S3 para entorno mas cercano a produccion.
3. Decidir exposicion de artifacts opcionales:
   - `vera-pitch-deck`
   - `vera-video-explainer`
4. Preparar paso a dominio real:
   - DNS
   - Clerk domain/CNAME
   - claves `live`.
5. Rotacion de credenciales usadas en pruebas (recomendado).
6. Actualizar documentacion principal (`README.md`, `SPEC.md`, `replit.md`) para reflejar estado post-refactor.
7. Mejorar analisis IA de CV para que se alinee al puesto concreto:
   - prompt contextual con titulo/departamento/ubicacion/descripcion de la vacante
   - nuevos campos de salida: `fitForPosition`, `matchScore`, `matchingSkills`, `missingSkills`, `reasoning`
   - UI con compatibilidad legacy para analisis historicos (`fitForFinancialServices`, `suggestedRating`).
8. Añadir fallback OCR opcional para PDFs image-based en extraccion de texto:
   - activable por `CV_OCR_FALLBACK_ENABLED=true`
   - parametros de control por entorno: idioma, timeout, maximo de paginas y umbral minimo de texto.

## Comandos utiles para retomar manana

```bash
cd /Users/italo/Documents/GitHub/vera-hiring-tracker-cursor/docker
docker compose -f docker-compose.yml --env-file .env up -d
docker compose -f docker-compose.yml --env-file .env ps
docker compose -f docker-compose.yml --env-file .env logs -f api
```
