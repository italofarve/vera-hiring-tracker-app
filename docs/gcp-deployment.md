# GCP Compute Engine Deployment Guide

Este documento describe cómo desplegar *Vera Hiring Tracker* en una máquina virtual de Google Cloud Platform (GCP - Compute Engine). La arquitectura es idéntica a la utilizada en DigitalOcean (Docker Compose + Caddy + PostgreSQL).

## 1. Recomendaciones de la Máquina Virtual

Para iniciar el prototipo, una máquina pequeña es suficiente:
- **Tipo de máquina:** `e2-micro` (gratuita en free tier en algunas regiones) o `e2-small` (2 vCPU, 2 GB RAM recomendado para OCR/PDFs pesados).
- **Sistema Operativo:** Ubuntu 22.04/24.04 LTS (o Container-Optimized OS si prefieres Docker nativo).
- **Disco:** 20 GB a 30 GB Standard Persistent Disk (pd-standard o pd-balanced).

## 2. Configuración de Firewall en GCP

Es crítico permitir el tráfico de red correcto. Al crear la instancia de Compute Engine, en la sección de "Firewall":
- [x] Marca **"Permitir tráfico HTTP"** (abre el puerto 80).
- [x] Marca **"Permitir tráfico HTTPS"** (abre el puerto 443).

El acceso SSH (puerto 22) se gestiona a través del IAP de Google Cloud o reglas de firewall predeterminadas. Es recomendable restringir el puerto 22 sólo a las IPs de administración.

## 3. Configuración de DNS

Apunta tu dominio (ej. `vera-gcp.italofarve.com`) a la **IP Externa** de tu nueva instancia de Compute Engine.
- Ve a tu proveedor de dominio (Godaddy, Namecheap, etc.)
- Crea un registro de tipo **A** con el nombre del subdominio (ej. `vera-gcp`) apuntando a la IP pública de GCP.

## 4. Autenticación (Clerk)

1. En el dashboard de Clerk (https://dashboard.clerk.com) selecciona tu aplicación.
2. Ve a **Domains** y añade tu nuevo dominio de producción: `vera-gcp.italofarve.com`.
3. Clerk generará registros CNAME que debes añadir a tu proveedor de DNS para validar el dominio y enviar los correos desde allí.
4. Obtén las claves `sk_live_...` y `pk_live_...` para producción.

## 5. Preparación del Entorno en la VM

Conéctate a la instancia desde tu máquina local usando `gcloud`:
```bash
gcloud compute ssh nombre-de-la-instancia --zone=tu-zona-gcp
```

Instala Docker y Git en la VM de GCP:
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose-v2 git -y
```

Clona o sube el repositorio:
```bash
git clone <URL-DEL-REPO>
cd vera-hiring-tracker-cursor/docker
```

## 6. Configuración Variables de Entorno (.env)

Crea y edita el archivo de entorno basado en el ejemplo:
```bash
cp .env.example .env
nano .env
```

Asegúrate de modificar las siguientes variables críticas:
- `DOMAIN=vera-gcp.italofarve.com`
- `POSTGRES_PASSWORD=<contraseña_url_safe>` (No uses caracteres especiales que rompan las URLs).
- `CLERK_SECRET_KEY=sk_live_...`
- `VITE_CLERK_PUBLISHABLE_KEY=pk_live_...`
- `SESSION_SECRET=<generar_con_openssl>`

> **Aviso de Seguridad:** No commitees secretos reales al repositorio. El archivo `.env` está ignorado en git.

## 7. Configuración de Allowlist (Acceso)

Prepara el CSV para que los usuarios puedan iniciar sesión:
```bash
cp allowed-emails.csv.example allowed-emails.csv
nano allowed-emails.csv
```
Añade tu email y el de los evaluadores, asegurándote de que el formato sea texto simple con los correos bajo la cabecera correspondiente.

## 8. Despliegue de los Contenedores

Levanta la infraestructura:
```bash
docker compose up -d --build
```

Comprueba que los contenedores están corriendo (`db`, `api`, `web`, `proxy`):
```bash
docker compose ps
```

Si hay algún problema, puedes revisar los logs:
```bash
docker compose logs -f api
docker compose logs -f proxy
```

## 9. Backup y Restauración de Base de Datos (Migración desde DO)

Si deseas migrar los datos que tenías en DigitalOcean a GCP:

1. **En DigitalOcean (exportar):**
   ```bash
   docker exec -t [nombre_contenedor_db] pg_dump -U vera vera_hiring > vera_backup_do.sql
   ```
2. Descarga `vera_backup_do.sql` a tu máquina local y luego súbelo a la VM de GCP usando `gcloud compute scp`.
3. **En GCP (importar):** (Asegúrate de que los contenedores ya estén corriendo con una DB vacía)
   ```bash
   cat vera_backup_do.sql | docker exec -i [nombre_contenedor_db_gcp] psql -U vera -d vera_hiring
   ```

## Checklist Final de Verificación
- [ ] ¿El healthcheck de la API responde OK? (`https://vera-gcp.italofarve.com/api/healthz`)
- [ ] ¿El login de Clerk funciona correctamente?
- [ ] ¿El allowlist funciona y permite acceder a los usuarios autorizados?
- [ ] ¿Funciona la subida de un CV (PDF/Word) y el sistema de IA/OCR lo lee correctamente?
