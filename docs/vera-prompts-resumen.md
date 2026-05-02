# Vera Hiring Tracker — Resumen de instrucciones

Registro de los prompts utilizados para construir la plataforma completa, sus recursos documentales y materiales de presentación.

---

## Prompt 1 — Aplicación principal

Construye una plataforma completa de gestión de talento (Hiring Tracker) para **Vera**, una entidad financiera. La aplicación debe incluir:

- Pipeline de candidatos con 7 etapas: Aplicado → Preselección → Entrevista Técnica → Entrevista RR.HH. → Entrevista Final → Oferta → Contratado/Rechazado
- Módulo de entrevistas con programación y confirmación automática
- Feedback estructurado por entrevistador con valoración por estrellas
- Análisis de CV con IA (OpenAI GPT) que genere resumen, habilidades, adecuación al sector financiero y recomendación
- Notificaciones automáticas por email (Resend) en cada hito del proceso
- Portal público para candidatos sin necesidad de registro
- Autenticación con Clerk para el equipo interno
- Identidad visual Vera: navy `#1E3A5F`, teal `#0D9488`, fuente Plus Jakarta Sans

---

## Prompt 2 — Guía funcional y página de ayuda

Crea una guía funcional completa de la plataforma en `docs/vera-hiring-tracker-functional-guide.md` con todos los módulos, flujos de trabajo y casos de uso. Además, construye una página de **Ayuda** dentro de la app con:

- Secciones acordeón por módulo
- Guía paso a paso para el equipo de RR.HH.
- Guía para candidatos
- Resumen de notificaciones automáticas
- Accesos rápidos a las secciones principales

---

## Prompt 3 — Correcciones y mejoras de la app

Revisa y corrige los errores existentes: rutas del portal público, análisis de CV (subida de archivos PDF/DOCX + texto plano), emails automáticos, y asegúrate de que todo el flujo de candidatos funcione end-to-end. Ajusta el diseño de la plataforma para que sea consistente con la identidad de Vera en todos los módulos.

---

## Prompt 4 — Pitch deck y vídeo explicativo

Crea dos recursos de documentación ejecutiva:

**1. Pitch deck de 7 diapositivas** para presentar a dirección, usando la plantilla analytics-dashboard con la paleta Vera (navy/teal). Diapositivas:

1. Portada
2. Problema
3. Solución
4. Análisis IA
5. Impacto / Métricas
6. Arquitectura técnica
7. Próximos pasos

Incluir botón para descargar como PDF.

**2. Vídeo explicativo animado** con 5 escenas enfocadas en:

- El análisis de CV con IA como ventaja competitiva principal
- El pipeline de selección de 7 etapas
- La comunicación automática con candidatos

Estética "Tech Premium Financial": autoritario, sofisticado, confianza institucional. Animaciones de nivel agencia. Incluir controles interactivos para navegar entre escenas.

Añadir enlaces a ambos recursos en la sección de **Ayuda** de la aplicación principal.
