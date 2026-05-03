# DigitalOcean Deployment Session - 2026-05-03

## Objetivo

Desplegar `vera-hiring-tracker-cursor` en un Droplet de DigitalOcean usando Docker Compose, con dominio `vera.italofarve.com`, Clerk en produccion y datos demo restaurados.

## Resultado actual

- Droplet creado en Frankfurt (Ubuntu, 1 GB RAM, 25 GB SSD).
- Acceso SSH por clave dedicado (`id_ed25519_vera_do`).
- Firewall DO aplicado al Droplet nuevo:
  - `22` solo IP admin (`/32`)
  - `80` y `443` abiertos.
- DNS configurado:
  - `A` record `vera -> 64.226.108.163`
  - Clerk DNS validado para dominio de produccion.
- Docker y Docker Compose instalados en el Droplet.
- App desplegada con Compose (`db`, `api`, `web`, `proxy`).
- Healthcheck OK en `https://vera.italofarve.com/api/healthz`.
- Backup SQL restaurado con conteos validados:
  - `positions`: 5
  - `candidates`: 10
  - `interviews`: 5
  - `feedback`: 2
  - `activity`: 9

## Incidencias encontradas y solucion

1. `api` en loop de reinicio con `drizzle-kit push --force`.
   - Causa: password de Postgres en `.env` no coincidia con volumen inicial de `db`.
   - Solucion: cambiar `POSTGRES_PASSWORD` a valor URL-safe y recrear volumen de `db` (`docker compose down -v` + `up`).

2. `allowed-emails.csv` en DO creado accidentalmente como directorio.
   - Causa: guardado accidental con `nano` + copia por `scp` hacia ruta interpretada como carpeta.
   - Solucion: convertirlo a archivo regular `docker/allowed-emails.csv`, recrear `api` y verificar con `grep` dentro del contenedor.

3. Login denegado pese a emails permitidos.
   - Causa temporal: allowlist mal montada por problema anterior.
   - Estado: CSV corregido y montado correctamente; validar de nuevo desde navegador tras limpiar cookies si persiste.

## Pendiente para la proxima sesion

1. **PDF / CV text extraction en DO**
   - Error observado en frontend: `POST /api/candidates/:id/cv-text` -> `422`.
   - Verificar variables OCR en `docker/.env` del Droplet:
     - `CV_OCR_FALLBACK_ENABLED=true`
     - `CV_OCR_LANG=eng`
     - `CV_OCR_MIN_TEXT_LENGTH=40`
     - `CV_OCR_TIMEOUT_MS=30000`
     - `CV_OCR_MAX_PAGES=5`
   - Revisar logs de `api` justo tras intentar extraer CV:
     - `docker compose logs --tail 200 api`

2. **Sign-out en produccion**
   - Revisar comportamiento en ventana de incognito.
   - Verificar en Clerk Production:
     - dominio `vera.italofarve.com` validado
     - `after sign-out URL` configurado a `https://vera.italofarve.com/`

3. **Hardening operativo**
   - Dejar script documentado para restore SQL.
   - Dejar procedimiento de backup periodico (`pg_dump`) en docs.

## Comandos utiles (DO)

```bash
# Estado de stack
cd ~/vera-hiring-tracker-cursor/docker
docker compose ps

# Health
curl -i https://vera.italofarve.com/api/healthz

# Logs API/proxy
docker compose logs --tail 120 api
docker compose logs --tail 120 proxy

# Ver allowlist dentro del contenedor
docker compose exec api sh -lc 'sed -n "1,40p" /app/artifacts/api-server/data/allowed-emails.csv'

# Confirmar email en allowlist
docker compose exec api sh -lc 'grep -in "ifarfan@faculty.ie.edu" /app/artifacts/api-server/data/allowed-emails.csv'
```

## Nota sobre acceso SSH desde Cursor

Se puede trabajar desde terminal integrada de Cursor con SSH al Droplet. El asistente no ejecuta comandos remotamente por si mismo, pero puede guiar paso a paso y validar salidas durante toda la operacion.
