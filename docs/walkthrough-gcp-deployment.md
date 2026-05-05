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

### 4. Configuración de Almacenamiento (Google Cloud Storage)
Para la subida de currículums, la API requiere ajustes específicos respecto a su entorno original en Replit:

1. **Estrategia de Subida Directa (Plan B)**: Para evitar problemas de permisos con URLs firmadas (`signBlob`), hemos implementado una subida directa desde el servidor al bucket usando el SDK oficial de Google.
2. **Normalización de Rutas**: Se ha corregido `normalizeObjectEntityPath` para que traduzca las rutas directas de GCS al formato `/objects/` que el resto de la aplicación espera, evitando errores **404 Not Found** al analizar archivos.
3. **Dependencias del Build**: Es crucial añadir `@google-cloud/storage` a la lista de librerías `external` en el archivo de construcción `build.mjs`.
4. **Variables de entorno**: La API requiere `PRIVATE_OBJECT_DIR` con el nombre del bucket de GCP.

### 5. Configuración de Inteligencia Artificial (Vertex AI / Gemini)
El sistema ha sido optimizado para usar **Gemini 2.5 Flash**, garantizando alta velocidad y capacidades multimodales nativas.
- **Modelo:** `gemini-2.5-flash` (seleccionado por su disponibilidad en el Model Garden de GCP).
- **Región:** `us-central1` (configurada específicamente para evitar restricciones regionales en modelos avanzados).
- **Lectura Inteligente de PDFs:** Se ha implementado un sistema de **Extracción Directa vía Gemini**. Dado que las librerías tradicionales de Node.js (`pdf-parse`) presentan conflictos en entornos empaquetados (Docker/Cloud Run), ahora Vera utiliza la capacidad visual de Gemini para leer los PDFs. Esto garantiza que incluso los PDFs basados en imágenes o con formatos complejos sean procesados sin errores **422**.

---

## 🧪 Pruebas de Verificación Finales
- [x] **Subida Directa a GCS:** Los archivos Word y PDF se guardan correctamente en el bucket.
- [x] **Análisis de Word:** Extracción de texto vía Mammoth + Análisis con Gemini.
- [x] **Análisis de PDF:** Extracción de texto directa vía Gemini + Análisis multimodal.
- [x] **Estabilidad:** Verificado flujo completo (Upload -> Extract -> Analyze) en la revisión **00027**.

## Solución de Problemas Comunes (Troubleshooting)

### Error 422 (Unprocessable Content) al extraer PDF
Este error ocurría por la incompatibilidad de la librería `pdf-parse` con el bundler.
**Solución:** Se ha modificado `artifacts/api-server/src/routes/cv.ts` para que use `gemini.analyzeCV` como extractor principal de texto para PDFs.

### Error 502 (Bad Gateway) al cargar la página
Si el frontend devuelve un 502 al intentar conectar con la API, asegúrate de que **no has desplegado la imagen del frontend sobre el servicio backend**. 
El `Dockerfile` es *multi-stage*. Si construyes la imagen sin especificar el `--target`, Docker construirá hasta el último stage (que es `web` / Nginx). Si despliegas Nginx en el servicio de la API, se creará un bucle infinito ("upstream timed out").
**Solución:** Construir siempre la imagen de la API usando `--target api`:
```bash
docker build --platform linux/amd64 --target api -t europe-west1-docker.pkg.dev/.../vera-api:latest -f docker/Dockerfile .
```

**Proyecto finalizado y operativo al 100%.** 🚀🥇
