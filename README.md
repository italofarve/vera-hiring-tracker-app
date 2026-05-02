# Vera Hiring Tracker

Aplicacion full-stack para gestionar procesos de seleccion (vacantes, candidatos, entrevistas, feedback y portal publico de postulacion), con analisis de CV asistido por IA.

Este repositorio corresponde a una refactorizacion y consolidacion local de un prototipo inicial construido en Replit. El objetivo actual es tener una base mantenible, dockerizable y lista para evolucionar fuera del entorno Replit.

## Stack

- Frontend: React + Vite + TanStack Query
- Backend: Express + Drizzle ORM
- Base de datos: PostgreSQL
- Auth: Clerk
- IA: OpenAI (analisis de CV)
- Monorepo: pnpm workspaces

## Estado actual

- Entorno Docker local operativo (`db`, `api`, `web`, `proxy`).
- Control de acceso por allowlist activo.
- Flujo de CV (subida + extraccion + analisis) funcionando en Docker con almacenamiento local.

## Inicio rapido (Docker)

1. Copia `docker/.env.example` a `docker/.env` y rellena claves.
1. Arranca:

```bash
cd docker
docker compose --env-file .env up -d
```

1. Abre `https://localhost`.

## Documentacion

- Roadmap vivo (fuente principal): `docs/roadmap.md`
- Estado de dockerizacion: `docs/dockerization-status-2026-05-01.md`
- Especificacion tecnica ampliada: `SPEC.md`
- Guia historica del prototipo/migracion: `replit.md`
