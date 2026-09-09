# GCP Cost Optimization & Architecture Learnings (Vera)

Este documento sirve como **guía permanente de lecciones aprendidas, configuración de costes y mejores prácticas** para el despliegue y mantenimiento de *Vera Hiring Tracker* y futuras aplicaciones en Google Cloud Platform (GCP).

---

## 📌 Resumen Ejecutivo del Estado de Costes

* **Coste mensual estimado:** **~7,50 € – 8,00 € / mes** (~0,24 € / día).
* **Estado de la arquitectura:** **Serverless de ultra-bajo coste**.
* **Proyecto GCP activo:** `vera-serverless-20260505` (Región `europe-west1`).

### Desglose por Servicio

| Servicio | Configuración Actual | Coste Aproximado | Estrategia de Ahorro |
| :--- | :--- | :--- | :--- |
| **Cloud SQL** | `db-f1-micro` (PostgreSQL 16, 10GB SSD, Monozona) | ~7,50 €/mes (90%+ de la factura) | Mínimo suelo técnico de GCP. Posible compartir con otras apps. |
| **Cloud Run** | `vera-api` y `vera-web` (Scale-to-Zero) | 0,00 €/mes | Entra 100% en el Free Tier (2M peticiones/mes gratis). |
| **Artifact Registry** | `vera-repo` con Cleanup Policy automática | < 0,10 €/mes | Eliminación de imágenes `UNTAGGED` > 7 días via JSON policy. |
| **Cloud Storage** | Bucket `vera-hiring-tracker-cvs` | < 0,05 €/mes | Almacenamiento estándar de ficheros CV. |
| **Compute Engine / Disks** | *Eliminado / Sin instancias* | 0,00 €/mes | Transición completa a Serverless efectuada el 8-Sept. |

---

## 💡 Lecciones Aprendidas y Reglas de Infraestructura

### 1. Cloud SQL: Elección de Tier y Estrategia de Recursos Compartidos

* **Suelo técnico de GCP:** El tipo de instancia `db-f1-micro` (1 vCPU compartida, 0,6 GB RAM) es el más económico posible en GCP para PostgreSQL gestionado (~7,50 €/mes).
* **Estrategia Multi-App / Recursos Compartidos (Recomendada):**
  * **Sí es posible y recomendable** reutilizar `vera-db-instance` para desplegar nuevas aplicaciones o MVPs sin pagar 7,50 €/mes adicionales por cada una.
  * **Cómo implementar:** Crear bases de datos aisladas dentro de la misma instancia (`CREATE DATABASE nueva_app_db;`) con usuarios y permisos independientes.
  * **Límite técnico a vigilar:** `db-f1-micro` cuenta con 614 MB de RAM. Es perfecta para 2-3 apps de bajo tráfico o uso interno. Si una nueva app requiere análisis de datos masivo o alto tráfico, se debe escalar el Tier de la instancia a `db-g1-small` (1.7 GB RAM).

### 2. Cloud Run: Compute Serverless a Coste Cero en Inactividad

* **Configuración:** Tanto la API (`vera-api`) como el Web (`vera-web`) están configurados en Cloud Run para escalar a **0 instancias** cuando no hay tráfico activo.
* **Multiorigen:** Desplegar nuevas aplicaciones en Cloud Run no genera costes fijos mensuales mientras el volumen total se mantenga dentro del Free Tier.
* **Construcción de imágenes Multi-Stage:** Al construir imágenes para Cloud Run con Docker, se debe especificar siempre el target correcto (ej. `--target api` o `--target web`) para evitar desplegar el servidor frontend Nginx sobre el backend.

### 3. Artifact Registry: Regla de Limpieza Automática (*Cleanup Policy*)

* **Problema detectado:** Los builds continuos de Docker acumulan rápidamente gigabytes de capas e imágenes históricas sin etiqueta (`UNTAGGED`), generando sobrecostes de almacenamiento.
* **Solución aplicada:** Se ha configurado una política oficial de limpieza en GCP ([`docker/gcp-cleanup-policy.json`](file:///Users/italo/Documents/GitHub/vera-hiring-tracker-cursor/docker/gcp-cleanup-policy.json)).

```json
[
  {
    "name": "delete-untagged-old-images",
    "action": {
      "type": "DELETE"
    },
    "condition": {
      "tagState": "UNTAGGED",
      "olderThan": "7d"
    }
  }
]
```

* **Regla:** Mantener activas las imágenes etiquetadas (`:latest`) y purgar automáticamente las imágenes históricas sin etiqueta de más de 7 días.

### 4. Inteligencia Artificial y Vertex AI (Gemini)

* **Autenticación nativa (ADC):** Uso de *Application Default Credentials* y roles IAM de GCP (`roles/aiplatform.user`), eliminando la necesidad de API Keys en el código o variables de entorno expuestas.
* **Optimización de Latencia y Costes de Tokens:** Para la evaluación de compatibilidad de CVs (`/analyze-cv`), se envía directamente el texto plano extraído cuando está disponible. Esto reduce la latencia en un 50-70% (2-4s por consulta) y minimiza el procesamiento binario de PDFs.
* **Sanitización de respuestas JSON:** Limpieza previa de bloques de código markdown (` ```json `) antes del parseo en el backend para evitar fallos de formato.

---

## 🔍 Checklist para Auditorías de Costes en GCP

Ejecutar estos comandos periódicamente o ante variaciones en la factura:

1. **Verificar recursos huérfanos en Compute Engine:**
   ```bash
   export CLOUDSDK_AUTH_ACCESS_TOKEN=$(gcloud auth application-default print-access-token)
   gcloud compute disks list --project=vera-serverless-20260505
   gcloud compute addresses list --project=vera-serverless-20260505
   ```
   *Criterio:* Deben listar `0 items` (no debe haber discos sueltos ni IPs fijas sin asignar).

2. **Comprobar tamaño del repositorio Artifact Registry:**
   ```bash
   gcloud artifacts repositories describe vera-repo --location=europe-west1 --project=vera-serverless-20260505
   ```
   *Criterio:* El tamaño del repositorio debe mantenerse por debajo de ~500 MB.

3. **Verificar estado de Cloud SQL:**
   ```bash
   gcloud sql instances list --project=vera-serverless-20260505
   ```
   *Criterio:* TIER en `db-f1-micro` y AVAILABILITY_TYPE en `ZONAL`.

---
*Última actualización: 2026-09-09 por Antigravity*
