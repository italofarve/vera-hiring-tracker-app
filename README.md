# 🚀 Vera Hiring Tracker (AI-Powered)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

**Vera** es una plataforma *Full-Stack* diseñada para transformar y automatizar el proceso de selección y reclutamiento. Evolucionando desde un prototipo monolítico hasta una arquitectura **Serverless en la nube**, Vera utiliza la capacidad multimodal de **Gemini 2.5 Flash** para "leer" y estructurar currículums complejos de forma precisa y ultrarrápida.

---

## 🏗️ Arquitectura del Sistema

*Nota: Aquí puedes colocar el diagrama exportado de Lucid Chart.*
![Diagrama de Arquitectura de Vera](./docs/architecture-diagram.png)

El sistema está diseñado pensando en escalabilidad y reducción de costos operativos (Serverless):
- **Frontend (Web):** Single Page Application construida con React, Vite y TanStack Query.
- **Backend (API):** Servidor Node.js (Express) robusto, conectado a una base de datos PostgreSQL mediante Drizzle ORM.
- **Infraestructura Cloud:** Despliegue en **Google Cloud Run** (auto-escalado a cero) usando contenedores de Docker.
- **AI Processing:** Integración directa entre Google Cloud Storage y Vertex AI (Gemini) para procesar documentos pesados sin colapsar la memoria del servidor.
- **Autenticación & Comunicaciones:** Protegido con **Clerk** y envío de notificaciones mediante **Resend**.

---

## 🌟 Características Principales

1. **Extracción Multimodal con IA:** A diferencia del OCR tradicional frágil (`pdf-parse`), Vera envía los PDFs directamente a la IA multimodal de Google para "leer" visualmente la estructura y devolver un JSON estructurado con las habilidades y experiencia del candidato.
2. **Evaluación de "Fit":** El sistema calcula automáticamente la idoneidad del candidato contra los requisitos específicos de la vacante utilizando Inteligencia Artificial.
3. **Control de Acceso (Allowlist):** Restricciones de seguridad avanzadas para permitir que solo usuarios pre-aprobados accedan a posiciones específicas.
4. **Infraestructura Inmutable (Docker):** Todo el entorno de desarrollo y producción está contenido en `docker-compose`, garantizando paridad entre lo que se programa y lo que se despliega.

---

## 🛠️ Instalación y Uso Local (Docker)

La forma más sencilla de probar Vera en tu máquina local es utilizando Docker.

1. **Clonar el repositorio y configurar variables de entorno:**
   ```bash
   cp docker/.env.example docker/.env
   # Asegúrate de rellenar las claves de Clerk y la Base de Datos en el nuevo archivo .env
   ```

2. **Levantar los contenedores:**
   ```bash
   cd docker
   docker compose up -d --build
   ```

3. **Acceder a la aplicación:**
   Abre `http://localhost` (o el puerto configurado por el proxy Caddy) en tu navegador web.

---

## 📚 Documentación Técnica

Para los desarrolladores o ingenieros de DevOps que quieran profundizar en las decisiones técnicas del proyecto:

- [Caso de Estudio Ejecutivo / Visión Empresarial](docs/EXECUTIVE_VISION.md)
- [Guía de Despliegue en Google Cloud Run](docs/gcp-deployment.md)
- [Runbook de Operaciones y Lecciones de OCR](docs/ops-runbook.md)
- [Especificación Técnica de la API](SPEC.md)

---
*Desarrollado con ❤️ asistido por IA.*
