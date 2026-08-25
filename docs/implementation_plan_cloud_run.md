# Plan: Migración a Arquitectura Serverless (Cloud Run)

Este plan describe la transición desde una arquitectura basada en VM (Monolito) a una arquitectura nativa de la nube, escalable y gestionada en GCP.

## Objetivos
- **Escalabilidad:** Permitir que la web y la API escalen automáticamente según el tráfico.
- **Mantenimiento Cero:** Eliminar la necesidad de actualizar el SO de la VM o gestionar Docker manualmente.
- **Coste Eficiente:** Pagar solo por lo que se usa (Pay-as-you-go).

## Arquitectura Propuesta

### 1. Computación (Cloud Run)
- **`vera-api`:** Servicio para el backend. Conexión directa a la base de datos y almacenamiento.
- **`vera-web`:** Servicio para el frontend (Nginx sirviendo React).

### 2. Base de Datos (Cloud SQL)
- Instancia de **PostgreSQL 16** gestionada.
- **Ventaja:** Backups automáticos, parches de seguridad gestionados por Google y alta disponibilidad.

### 3. Almacenamiento (Cloud Storage)
- Sustitución del volumen local `/app/uploads` por un **Bucket de GCP**.
- Requerirá actualizar la variable `CV_STORAGE_PROVIDER=gcs` en la API.

### 4. Inteligencia Artificial (Gemini / Vertex AI)
- Sustitución o alternativa a OpenAI por **Gemini 1.5 Flash/Pro** vía **Vertex AI SDK**.
- **Ventaja:** Soporte nativo para PDFs (vision/multimodal), eliminando la necesidad de OCR local.
- **Autenticación:** Uso de **Application Default Credentials (ADC)** y Roles IAM, eliminando la necesidad de API Keys en el código o secretos.

### 5. Secretos (Secret Manager)
- Almacenamiento seguro de llaves de Clerk y contraseñas de BD.
- Eliminación del archivo `.env` en favor de inyección directa desde GCP.

---

## Estado del Proyecto

### Fase 1: Preparación de Imágenes
- [x] Configurar **Artifact Registry** para guardar las imágenes de Docker.
- [x] Crear scripts para hacer `docker push` de la API y la Web (`scripts/gcp-build-push.sh`).

### Fase 2: Infraestructura de Datos
- [x] Crear instancia de **Cloud SQL**.
- [x] Crear Bucket en **Cloud Storage** (`vera-hiring-tracker-cvs`).

### Fase 3: Despliegue de Servicios e IA
- [x] Crear la librería `lib/integrations-gemini-ai-server`.
- [x] Actualizar la ruta `/analyze-cv` para soportar envío directo de archivos a Gemini (vision multimodal).
- [x] Desplegar `vera-api` en Cloud Run vinculando los secretos e IAM roles para Gemini (Vertex AI).
- [x] Desplegar `vera-web` en Cloud Run.
- [x] Añadir soporte para variable de entorno `GEMINI_MODEL` y optimizar la latencia del análisis de fit (envío de texto directo, reducción del 70% de tiempo).
- [x] Implementar desinfectador automático de comillas markdown (` ```json `) para garantizar el parseo correcto de la respuesta JSON.

---

## Configuración de Dominios Personalizados (Cloud Run)

Para mejorar la experiencia de usuario y accesibilidad, se han configurado los siguientes dominios mapeados al servicio frontend (`vera-web`) en la región `europe-west1`:

1. **Dominio Principal:** `https://vera-serverless.italofarve.com`
2. **Dominio Alternativo (subdominio):** `https://www.vera-serverless.italofarve.com`

Ambos dominios cuentan con certificados SSL gestionados automáticamente por Google Cloud.

---
*Rama de trabajo: deploy/gcp-cloud-run*
*Última actualización: 2026-08-25 por Antigravity*
