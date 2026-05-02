# Vera Hiring Tracker - Roadmap vivo

Ultima actualizacion: 2026-05-02

## Completado recientemente

1. Migracion y consolidacion local desde prototipo Replit a entorno Docker estable (`db`, `api`, `web`, `proxy`).
2. Repo GitHub nuevo publicado con historial limpio y reglas de seguridad reforzadas (`.gitignore`/backups/envs).
3. Flujo CV operativo en Docker con storage local (`CV_STORAGE_PROVIDER=local`).
4. Mejora de analisis IA de CV orientado al puesto:
   - prompt contextual por vacante (titulo, departamento, ubicacion, descripcion)
   - nuevos campos (`fitForPosition`, `matchScore`, `matchingSkills`, `missingSkills`, `reasoning`)
   - compatibilidad legacy en UI para analisis historicos.
5. Fallback OCR opcional para PDFs image-based:
   - activacion por flag de entorno
   - soporte en backend y Docker (`tesseract` + `poppler-utils` + datos `eng`).
6. Documentacion base actualizada (`README.md`, `SPEC.md`, `replit.md`) y creacion de este roadmap vivo.
7. Integracion de artifacts opcionales en Docker web para evitar enlaces rotos:
   - `vera-pitch-deck` publicado en `/vera-pitch-deck/`
   - `vera-video-explainer` publicado en `/vera-video-explainer/`.

## En curso / inmediato

1. Validacion funcional final de CV upload + extraction + AI en varios casos (PDF, DOCX).
2. Ajuste de estrategia para CV en PDF image-based:
   - fallback OCR ya implementado por flag (`CV_OCR_FALLBACK_ENABLED`)
   - validar rendimiento/calidad en mas muestras reales.

## Siguiente bloque (infra y producto)

1. Decidir estrategia de storage objetivo:
   - mantener local para dev
   - migrar a MinIO o S3 para entorno cercano a produccion.
2. Decidir exposicion de artifacts opcionales:
   - `vera-pitch-deck`
   - `vera-video-explainer`
3. Preparar paso a dominio real:
   - DNS
   - Clerk domain/CNAME
   - claves `live`.

## Seguridad y operacion

1. Rotacion de credenciales usadas en pruebas.
2. Revisar politica de backups y restauracion.
3. Definir logs/monitoring minimo para errores de extraccion CV y OCR.

## Backlog funcional

1. Webhooks Clerk para sincronizar usuarios eliminados.
2. Auditoria (`audit_log` con `user_email`, `action`, `entity`, `before/after`).
3. Roles dentro del allowlist (admin, recruiter, viewer).
4. Filtros y paginacion en listados.
5. Busqueda full-text en candidatos.
6. Internacionalizacion (UI hoy mezcla ingles y espanol).

## Referencias relacionadas

- Estado de dockerizacion: `docs/dockerization-status-2026-05-01.md`
- Especificacion tecnica ampliada: `SPEC.md`
- Guia historica de migracion desde Replit: `replit.md`
