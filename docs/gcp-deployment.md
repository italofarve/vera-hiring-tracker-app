# GCP Deployment & Infrastructure Guide

> [!NOTE]
> **Migración a Serverless Completada (Septiembre 2026):**
> La infraestructura basada en Máquina Virtual (`vera-hiring-tracker-vm` en `vera-hiring-tracker-20260504`) ha sido **retirada**. La aplicación opera actualmente en arquitectura **Serverless (Cloud Run + Cloud SQL `db-f1-micro`)** en el proyecto **`vera-serverless-20260505`**.
> Para detalles de optimización y lecciones aprendidas de costes, consultar [`docs/gcp-cost-optimization-learnings.md`](file:///Users/italo/Documents/GitHub/vera-hiring-tracker-cursor/docs/gcp-cost-optimization-learnings.md).

## 1. Detalles de la Infraestructura Activa (Serverless)

- **Proyecto GCP:** `vera-serverless-20260505`
- **Región:** `europe-west1` (Bélgica)
- **Servicios de Cómputo:** Cloud Run (`vera-api` y `vera-web`)
- **Base de Datos:** Cloud SQL PostgreSQL 16 (`vera-db-instance`, tier `db-f1-micro`, 10 GB SSD)
- **Almacenamiento:** Cloud Storage (`vera-hiring-tracker-cvs`)
- **Coste Mensual Proyectado:** ~7,50 € - 8,00 € / mes


## 2. Configuración de Red (Firewall)

Se han habilitado las siguientes reglas de entrada en la consola de GCP:
- **HTTP (Puerto 80):** Permitido para redirección y retos de Let's Encrypt.
- **HTTPS (Puerto 443):** Permitido para tráfico seguro de la aplicación.
- **SSH (Puerto 22):** Permitido para administración vía `gcloud` o llaves autorizadas.

## 3. Dominios y Servicios Externos

- **Dominio Principal:** `https://vera-gcp.italofarve.com`
- **Auth (Clerk):** Se utiliza una aplicación de producción separada con dominio secundario configurado en `clerk.vera-gcp.italofarve.com`.
- **DNS:** Un registro tipo `A` apunta `vera-gcp` a la IP `35.241.212.0`.

## 4. Proceso de Despliegue Automatizado

El despliegue se gestiona mediante **Docker Compose**. Los servicios son:
1. **db:** PostgreSQL 16 (Persistencia en volumen `db-data`).
2. **api:** Backend Express (Node 24).
3. **web:** Frontend React (Nginx, con llaves de Clerk integradas en el build).
4. **proxy:** Caddy (Gestión automática de certificados SSL).

### Comandos de Mantenimiento

Para actualizar el código en el servidor:
```bash
# 1. Desde tu Mac, sube los archivos (sin node_modules)
tar --exclude='node_modules' --exclude='.git' -czf project.tar.gz .
gcloud compute scp project.tar.gz italo@vera-hiring-tracker-vm:~/project.tar.gz --project=vera-hiring-tracker-20260504 --zone=europe-west1-b

# 2. Entra por SSH
gcloud compute ssh vera-hiring-tracker-vm --project=vera-hiring-tracker-20260504 --zone=europe-west1-b

# 3. Descomprime y reconstruye
cd ~/vera-hiring-tracker-cursor/docker
tar -xzf ~/project.tar.gz -C ~/vera-hiring-tracker-cursor
sudo docker compose up -d --build
```

## 5. Gestión de Accesos (Allowlist)

La aplicación solo permite el acceso a los emails listados en:
`docker/allowed-emails.csv`

Si editas este archivo en el servidor, debes reiniciar el contenedor de la API para que los cambios surtan efecto:
`sudo docker compose restart api`

---
*Última actualización: 2026-05-05 por Antigravity*
