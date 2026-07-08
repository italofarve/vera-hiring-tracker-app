# Vera Hiring Tracker — Guía Funcional

## ¿Qué es Vera Hiring Tracker?

Vera Hiring Tracker es una plataforma digital de gestión del talento diseñada para equipos de Recursos Humanos de entidades financieras. Permite gestionar de forma centralizada todo el ciclo de vida de un proceso de selección: desde la publicación de vacantes hasta la contratación final, pasando por la planificación de entrevistas, la recopilación de feedback y el análisis inteligente de candidaturas.

La plataforma tiene dos entornos diferenciados:

- **Panel de RR.HH.** — acceso privado para el equipo de talento, con autenticación segura.
- **Portal de candidatos** — acceso público donde los candidatos descubren vacantes y envían su candidatura.

---

## Servicios y módulos

### 1. Dashboard — Vista ejecutiva
Panel de control con métricas clave en tiempo real:
- Total de candidatos activos y su distribución por etapa del pipeline
- Posiciones abiertas y estado de cobertura
- Entrevistas programadas próximamente
- Actividad reciente del equipo (cambios de etapa, nuevas incorporaciones)

**Impacto:** Permite al responsable de RR.HH. tener una fotografía instantánea del estado global de los procesos, sin necesidad de consultar múltiples sistemas.

---

### 2. Candidatos — Gestión del pipeline
Gestión completa de todos los candidatos en proceso:
- Vista de lista con filtros por etapa, estado, posición y búsqueda por nombre
- Perfil detallado de cada candidato: datos personales, posición aplicada, etapa actual, puntuación, notas internas
- Cambio de etapa con un clic: `Aplicado → Preselección → Entrevista Técnica → Entrevista RR.HH. → Entrevista Final → Oferta → Contratado / Rechazado`
- Cada cambio de etapa genera automáticamente una notificación por email al candidato

**Impacto:** Elimina hojas de cálculo y emails dispersos. Todo el equipo trabaja sobre el mismo estado actualizado en tiempo real.

---

### 3. Análisis de CV con Inteligencia Artificial
Dentro de cada perfil de candidato, el equipo de RR.HH. puede aprovechar la inteligencia artificial para contrastar automáticamente el CV con los requisitos del puesto:
- **Flujo simplificado**: Subir el CV del candidato (PDF o Word) y hacer clic directamente en "Analizar CV con IA". La plataforma se encarga de extraer el texto en segundo plano y enviarlo a la IA en un solo paso.
- **Vista de resultados ("Show analysis")**: Una vez analizado, se despliega un reporte estructurado y detallado que devuelve:
  - **Grado de adecuación** del perfil con la lógica de negocio del departamento (Alta / Media / Baja)
  - **Resumen ejecutivo** del perfil
  - **Años de experiencia** estimados y **Nivel educativo**
  - **Habilidades principales** e **Idiomas** detectados
  - **Puntos fuertes** del candidato y **Áreas a explorar** en la entrevista
  - **Valoración sugerida** (1–5 estrellas) y **Siguiente paso recomendado**
- **Actualizaciones ágiles**: Si el CV cambia o se necesita actualizar la evaluación, el usuario puede desplegar los resultados y pulsar el botón **"Re-analizar"** ubicado al final del reporte.

**Impacto:** Reduce el tiempo de criba curricular hasta un 70%. Un recruiter puede evaluar un perfil en segundos en lugar de minutos, con criterios objetivos y consistentes.

---

### 4. Posiciones — Gestión de vacantes
Control total sobre las posiciones abiertas en la organización:
- Creación y edición de vacantes con título, departamento, ubicación, tipo de contrato y número de plazas
- Estado de la posición: abierta, en pausa, cerrada
- Vista de candidatos asociados a cada posición
- Métricas de conversión por vacante

**Impacto:** Permite planificar la cobertura de plantilla con datos reales y saber en qué punto está cada proceso de selección.

---

### 5. Entrevistas — Planificación y seguimiento
Herramienta de gestión de entrevistas integrada con el pipeline:
- Programación de entrevistas asignadas a un candidato y una posición
- Tipos de entrevista: Screening telefónico, Técnica, RR.HH., Panel, Final
- Registro de entrevistador, fecha/hora, duración, modalidad (presencial / videollamada / teléfono) y enlace de reunión
- Al programar una entrevista, el candidato recibe automáticamente un email de confirmación con los detalles

**Impacto:** Centraliza la agenda de procesos selectivos y garantiza que los candidatos estén siempre informados.

---

### 6. Feedback — Evaluaciones estructuradas
Sistema de evaluación post-entrevista:
- Registro de feedback por entrevistador y por entrevista
- Puntuación por estrellas (1–5)
- Campos de texto para fortalezas observadas, aspectos a mejorar y notas adicionales
- Recomendación de decisión: Contratar / Rechazar / Pendiente de valoración

**Impacto:** Estandariza el criterio de evaluación entre distintos entrevistadores y evita decisiones basadas en percepciones subjetivas sin registro.

---

### 7. Portal de Candidatos — Experiencia del aspirante
Microsite público accesible en `/portal` sin necesidad de registro:
- Listado de todas las vacantes abiertas con buscador por título, departamento y ubicación
- Ficha de cada vacante con descripción, tipo de contrato, ubicación y número de plazas
- Formulario de candidatura con:
  - Nombre y apellidos
  - Email de contacto
  - Teléfono
  - Subida de CV (PDF o Word)
  - Carta de presentación / notas adicionales
- Confirmación inmediata al candidato al enviar la solicitud
- La candidatura entra directamente en el pipeline de RR.HH. en etapa "Aplicado"

**Impacto:** Mejora la experiencia del candidato, reduce la fricción en el proceso de aplicación y elimina la gestión manual de candidaturas recibidas por email.

---

### 8. Notificaciones automáticas por email
La plataforma envía emails automáticos en los siguientes momentos clave:
| Evento | Destinatario |
|---|---|
| Candidatura recibida | Candidato |
| Cambio de etapa en el pipeline | Candidato |
| Entrevista programada | Candidato |
| Extensión de oferta | Candidato |

Todos los emails están personalizados con el nombre del candidato y la posición. El sistema tiene fallback graceful: si no hay proveedor de email configurado, las notificaciones se registran internamente sin interrumpir el flujo.

---

## Cómo usar la aplicación

### Perfil: Técnico/a de RR.HH. o Recruiter

**Acceso:**
1. Ir a la URL de la plataforma
2. Crear cuenta en `/sign-up` (email/contraseña o Google)
3. A partir de ahí, acceso completo a todos los módulos

**Flujo de trabajo típico:**

```
1. Crear una vacante en "Posiciones"
   → Define título, departamento, ubicación, tipo de contrato y número de plazas

2. Activar la vacante
   → La posición aparece automáticamente en el Portal de Candidatos

3. Revisar candidaturas entrantes en "Candidatos"
   → Filtrar por posición o etapa para ver los nuevos aplicantes

4. Analizar CV con IA
   → Entrar al perfil del candidato → sección "CV & AI Analysis"
   → Subir el CV o pegar el texto → obtener evaluación en segundos

5. Avanzar en el pipeline
   → Cambiar la etapa del candidato (Preselección, Entrevista, etc.)
   → El candidato recibe notificación automática

6. Programar entrevistas
   → Módulo "Entrevistas" → asignar entrevistador, fecha y modalidad
   → El candidato recibe confirmación por email

7. Registrar feedback
   → Módulo "Feedback" → evaluar al candidato post-entrevista

8. Tomar decisión final
   → Cambiar etapa a "Contratado" o "Rechazado"
   → El candidato recibe notificación del resultado
```

---

### Perfil: Candidato/a

**Acceso:** No requiere registro ni contraseña.

**Flujo de candidatura:**

```
1. Acceder al portal en /portal
   → Ver todas las vacantes abiertas

2. Buscar una vacante de interés
   → Usar el buscador por título, departamento o ciudad

3. Hacer clic en "Apply now"
   → Abrir el formulario de candidatura

4. Completar el formulario
   → Nombre, email, teléfono (opcional)
   → Subir CV en PDF o Word (opcional)
   → Añadir carta de presentación o notas

5. Enviar la candidatura
   → Recibir confirmación en pantalla inmediatamente
   → Recibir email de acuse de recibo
   → La candidatura queda registrada en el sistema de RR.HH.

6. Seguimiento
   → El candidato recibirá emails automáticos en cada cambio de estado
```

---

## Impacto para la organización

| Área | Antes | Con Vera Hiring Tracker |
|---|---|---|
| Gestión de candidatos | Hojas de cálculo, email | Pipeline centralizado y actualizado en tiempo real |
| Criba curricular | 5–10 min por CV | < 30 segundos con análisis de IA |
| Comunicación con candidatos | Manual, inconsistente | Automática en cada hito del proceso |
| Planificación de entrevistas | Coordinación por email | Gestión integrada en la plataforma |
| Evaluación de candidatos | Criterios subjetivos | Feedback estructurado y comparable |
| Experiencia del candidato | Formularios externos o email | Portal propio, moderno y con confirmación inmediata |
| Reporting | Inexistente o manual | Dashboard con métricas en tiempo real |

---

## Tecnología

- **Frontend:** React + Vite — rápido, moderno y responsive
- **Backend:** Node.js + Express — API robusta y escalable
- **Base de datos:** PostgreSQL — datos seguros y persistentes
- **Autenticación:** Clerk — inicio de sesión seguro con soporte para Google OAuth
- **IA:** OpenAI GPT — análisis de CV en lenguaje natural
- **Almacenamiento:** Replit Object Storage — CVs y documentos guardados de forma segura
- **Emails:** Resend — notificaciones transaccionales fiables

---

## Accesos rápidos

| Módulo | URL |
|---|---|
| Portal de candidatos (público) | `/portal` |
| Iniciar sesión (RR.HH.) | `/sign-in` |
| Crear cuenta (RR.HH.) | `/sign-up` |
| Dashboard | `/` |
| Candidatos | `/candidates` |
| Posiciones | `/positions` |
| Entrevistas | `/interviews` |
| Feedback | `/feedback` |
