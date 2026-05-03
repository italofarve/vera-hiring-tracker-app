# Despliegue con Docker — Vera Hiring Tracker

Esta guía te lleva de cero hasta tener la app corriendo en HTTPS sobre un dominio propio.

> Antes de seguir: lee la **sección 8.4 del `SPEC.md`** ("Migración fuera de Replit en detalle"). Explica qué decisiones toma esta configuración por defecto y por qué.

---

## Requisitos previos

- Un servidor Linux (Ubuntu 22.04+ recomendado) con:
  - **Docker Engine** 24+ y **Docker Compose** v2 (`docker compose ...`).
  - Puertos **80** y **443** abiertos al exterior.
  - Al menos 2 GB de RAM y 10 GB de disco libres.
- Un **dominio** apuntando por DNS al servidor (registro A o AAAA).
- Una cuenta de **Clerk** con una aplicación creada (necesitas la `Publishable key` y la `Secret key`).
- El **CSV** con los emails permitidos (lo extraes de la hoja de Google con la que has trabajado).

---

## 1. Preparar el servidor

```bash
# Conéctate al servidor
ssh tu-usuario@tu-servidor

# Clona el repo
git clone https://github.com/italofarve/vera-hiring-tracker.git
cd vera-hiring-tracker
```

## 2. Configurar Clerk para producción

Antes de arrancar la app, registra el dominio en Clerk:

1. Entra en [dashboard.clerk.com](https://dashboard.clerk.com) → tu aplicación.
2. Ve a **Domains** → **Add domain** → introduce `vera.tudominio.com` (tu dominio real).
3. Clerk te mostrará uno o varios registros DNS tipo `CNAME` (algo como `clerk.vera.tudominio.com → frontend-api.clerk.services`).
4. Crea esos registros en tu proveedor DNS (Cloudflare, GoDaddy, Namecheap…). Pueden tardar unas horas en propagar.
5. En la sección **API Keys** copia la `Publishable key` (`pk_live_...`) y la `Secret key` (`sk_live_...`). Las usarás en el siguiente paso.

> Si **no quieres tocar DNS** ahora, puedes seguir usando el sistema de proxy y la app seguirá funcionando, pero cada login será más lento. Para esa opción, mira el comentario sobre `VITE_CLERK_PROXY_URL` en `SPEC.md` sección 8.4.C.

## 3. Configurar las variables de entorno

```bash
cd docker
cp .env.example .env
nano .env   # o el editor que prefieras
```

Rellena al menos:

- `COMPOSE_PROJECT_NAME` → nombre corto para prefijo de contenedores (ej: `vera-hiring-tracker-cursor`). Si lo omites, Compose usará el nombre de la carpeta (`docker`).
- `DOMAIN` → tu dominio real (ej: `vera.tudominio.com`).
- `POSTGRES_PASSWORD` → password fuerte para la base de datos.
- `CLERK_SECRET_KEY` → del dashboard de Clerk.
- `VITE_CLERK_PUBLISHABLE_KEY` → del dashboard de Clerk.
- `SESSION_SECRET` → genera uno con `openssl rand -hex 32`.

Las demás variables son opcionales (Resend, OpenAI, etc.).

## 4. Preparar el CSV de emails permitidos

```bash
# Desde el directorio docker/
cp allowed-emails.csv.example allowed-emails.csv
nano allowed-emails.csv
```

Formato del archivo:

```csv
email
alumno1@ie.edu
alumno2@ie.edu
```

> **Importante**: la primera línea siempre debe ser `email` (es la cabecera).

Cuando quieras añadir o quitar a alguien:
1. Edita este archivo.
2. Recarga la lista sin reiniciar:
   ```bash
   curl -X POST https://vera.tudominio.com/api/access/reload \
     -H "Authorization: Bearer <token-de-un-usuario-permitido>"
   ```
   O simplemente reinicia el contenedor:
   ```bash
   docker compose restart api
   ```

## 5. Arrancar la aplicación

```bash
# Build + arranque en background
docker compose up -d --build

# Ver logs en directo (Ctrl+C para salir, sigue corriendo)
docker compose logs -f
```

La primera vez tarda **5-10 minutos** porque construye dos imágenes desde cero. Las siguientes veces es mucho más rápido (caché).

Cuando los logs muestren `Server listening` y Caddy diga `certificate obtained successfully`, abre `https://vera.tudominio.com` en el navegador.

## 6. Comprobar que todo funciona

```bash
# Health check del backend
curl https://vera.tudominio.com/api/healthz
# → {"status":"ok"}

# Verifica que la lista de allowlist está cargada (necesita auth)
# Hazlo desde el navegador: entra, intenta loguearte con un email de la lista
# y otro fuera de la lista. Debe permitir el primero y bloquear el segundo
# con el mensaje en español.

# Estado de los contenedores
docker compose ps
```

---

## Operaciones comunes

### Actualizar a una nueva versión del código

```bash
cd vera-hiring-tracker
git pull
cd docker
docker compose up -d --build
```

### Ver logs de un servicio concreto

```bash
docker compose logs -f api
docker compose logs -f web
docker compose logs -f proxy
docker compose logs -f db
```

### Backup de la base de datos

```bash
# Crear backup
docker compose exec db pg_dump -U vera vera_hiring > backup-$(date +%F).sql

# Restaurar
cat backup-2026-04-30.sql | docker compose exec -T db psql -U vera vera_hiring
```

### Acceder a la base de datos

```bash
docker compose exec db psql -U vera vera_hiring
```

### Reiniciar un servicio sin tocar los demás

```bash
docker compose restart api
```

### Parar todo (sin perder datos)

```bash
docker compose down
```

### Borrar TODO incluyendo datos (¡cuidado!)

```bash
docker compose down -v   # -v borra los volúmenes (db + cv-uploads + caddy)
```

---

## Solución de problemas

### "no se obtiene certificado HTTPS"

- Verifica que el dominio apunta a la IP del servidor: `dig vera.tudominio.com`.
- Verifica que los puertos 80 y 443 están abiertos en el firewall.
- Mira logs de Caddy: `docker compose logs proxy`.
- Let's Encrypt tiene rate limits — si has reintentado mucho, espera 1 hora.

### "Acceso denegado" para emails que sí están en la lista

- Verifica el formato del CSV: primera línea `email`, sin espacios extra.
- Comprueba que el archivo está montado: `docker compose exec api cat /app/artifacts/api-server/data/allowed-emails.csv`.
- Recarga: `curl -X POST https://vera.tudominio.com/api/access/reload -H "Authorization: Bearer ..."`.

### "Cannot connect to database"

- Verifica que el servicio `db` está corriendo: `docker compose ps`.
- Espera unos segundos en el primer arranque (postgres tarda en inicializar).
- Mira logs: `docker compose logs db`.

### El frontend muestra "Loading..." indefinidamente

- Comprueba en la consola del navegador (F12) si hay errores de Clerk.
- Verifica que `VITE_CLERK_PUBLISHABLE_KEY` se pasó en build time. Si la cambias, hay que **rebuilder**: `docker compose up -d --build web`.
- Si has cambiado el dominio en Clerk, los usuarios viejos pueden tener cookies cacheadas — pídeles que limpien cookies de tu dominio.

### Build muy lento o se queda sin memoria

- El build necesita ~2 GB RAM. En servidores pequeños añade swap:
  ```bash
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  ```

---

## ¿Qué hace cada archivo?

| Archivo | Qué hace |
|---|---|
| `Dockerfile` | Imagen multi-stage con dos targets: `api` (Node 24 + Express) y `web` (nginx + estáticos) |
| `docker-compose.yml` | Orquesta los 4 servicios: db, api, web, proxy |
| `Caddyfile` | Configuración del reverse proxy (rutea `/api/*` al backend, todo lo demás al frontend) |
| `nginx-web.conf` | Config de nginx que sirve los estáticos del frontend con SPA fallback |
| `.env.example` | Plantilla de variables (cópiala como `.env`) |
| `allowed-emails.csv.example` | Plantilla del CSV de allowlist |

## Pasos siguientes recomendados

1. **Backups automáticos** de la base de datos (cron + script de `pg_dump`).
2. **Monitoreo** (UptimeRobot, Better Uptime, o un Grafana + Prometheus).
3. **Migraciones SQL versionadas** en lugar de `drizzle-kit push --force` al arranque (cuando la app vaya a producción seria).
4. **Object Storage real** para los CVs (S3, GCS o MinIO) en lugar del volumen local.
5. **Limpiar plugins de Replit** del código (ver `SPEC.md` sección 8.4.B).
