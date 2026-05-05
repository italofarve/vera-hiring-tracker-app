# Walkthrough: Despliegue Exitoso en GCP

Este documento resume las acciones realizadas para migrar *Vera Hiring Tracker* a Google Cloud Platform.

## 🏁 Hitos Conseguidos

### 1. Infraestructura como Código (Automática)
- Creación del proyecto `vera-hiring-tracker-20260504` vía CLI.
- Activación de facturación y APIs de Compute Engine.
- Creación de la VM `e2-small` con Ubuntu 24.04.
- Apertura de puertos 80/443 y configuración de Firewall.

### 2. Configuración del Servidor (Hardening)
- Instalación de Docker y Git.
- Configuración de **2GB de memoria Swap** para soportar el análisis de PDFs pesados.
- Conexión segura establecida mediante `gcloud compute ssh`.

### 3. Despliegue de la Aplicación
- Transferencia del código fuente comprimido.
- Configuración de variables de entorno `.env` (Producción).
- Levantamiento de los 4 servicios con `docker compose`.
- **Certificado SSL automático** obtenido mediante Caddy para `vera-gcp.italofarve.com`.

### 4. Migración de Datos
- Restauración exitosa del backup SQL (`.sql`) en el contenedor de PostgreSQL de GCP.
- Verificación de persistencia mediante volúmenes de Docker.

## 🧪 Pruebas de Verificación Realizadas
- [x] **Acceso HTTPS:** Verificado carga de la web con candado.
- [x] **Auth:** Login y Logout funcional con Clerk (Modo Live).
- [x] **Análisis de CV:** Procesamiento exitoso de archivos Word y PDF.
- [x] **Seguridad:** Middleware de *Allowlist* (CSV) verificado.

---
**Entorno listo para pruebas finales de usuario.**
