# Caso de Estudio Ejecutivo: Vera Hiring Tracker

**Arquitectura, Decisión Tecnológica y Visión "Enterprise"**

Este documento está diseñado como material de estudio para analizar la evolución arquitectónica de *Vera Hiring Tracker*, un sistema de reclutamiento impulsado por Inteligencia Artificial, y su despliegue en Google Cloud Platform (GCP) utilizando un enfoque **Serverless (Sin Servidor)**.

---

## 1. El Problema de Negocio

El departamento de Recursos Humanos moderno se enfrenta a un "cuello de botella" de datos: miles de currículums (CVs) en formatos dispares (PDF, Word, Texto) que deben ser leídos, estructurados y evaluados contra posiciones específicas en tiempo récord.
El objetivo de **Vera** es automatizar esta ingesta de documentos y utilizar IA (Modelos de Lenguaje Grande o LLMs) para extraer competencias, evaluar el "fit" del candidato y estructurar los datos para la toma de decisiones.

## 2. La Decisión Arquitectónica: Serverless vs. Monolito

Para resolver este problema, se ha optado por un enfoque **Serverless** (Cloud Run) frente al tradicional **Monolito en Máquina Virtual (IaaS)**.

### ¿Por qué Serverless? (Pros)

1. **Auto-Escalado a Cero y bajo Demanda:** El procesamiento de CVs es un trabajo esporádico (en picos durante campañas de reclutamiento). Cloud Run escala automáticamente los contenedores desde 0 hasta el número necesario para procesar los CVs, y luego se apaga. **Pago exclusivo por milisegundo de cómputo.**
2. **Cero Mantenimiento de Sistema Operativo:** A diferencia de Digital Ocean o Compute Engine (donde hay que parchear Ubuntu, configurar Nginx, gestionar el disco y la memoria Swap), Google gestiona la infraestructura subyacente.
3. **Integración Nativa con el Ecosistema GCP:** La arquitectura serverless permite usar la seguridad nativa de Google (IAM) para conectar la API de Vera de forma directa y segura con Google Cloud Storage (para los PDFs) y Vertex AI (Gemini), sin manejar claves de API manuales.
4. **Resiliencia Frontend/Backend:** La API y la Aplicación Web corren en el mismo servicio contenedorizado pero responden de forma asíncrona.

### Desafíos del Enfoque Serverless (Contras)

1. **El "Cold Start" (Arranque en Frío):** Cuando el servicio escala desde 0, la primera petición puede tardar unos segundos extra en responder mientras Google levanta el contenedor.
2. **Falta de Estado (Stateless):** Los contenedores Cloud Run no guardan archivos locales. Esto nos obligó a rediseñar la extracción de PDFs para que la API leyera el documento directamente desde Cloud Storage, en lugar de usar el disco local del servidor (como se haría en un monolito).
3. **Vendor Lock-in Parcial:** Aunque el código está en contenedores (Docker), dependemos fuertemente de servicios propietarios como *Vertex AI* y *Cloud Storage*.

---

## 3. El Paradigma Multimodal con Gemini 2.5 Flash

Uno de los mayores retos técnicos fue la extracción de texto de **PDFs complejos** (imágenes incrustadas, columnas, fuentes raras).

*   **El Enfoque Antiguo (Frágil):** Usar librerías de Node.js (`pdf-parse`) o motores OCR instalados en el servidor. Esto consume muchísima memoria y a menudo falla en contenedores debido a incompatibilidades de dependencias o falta de binarios en el sistema.
*   **La Solución Actual (Multimodal):** Se eliminó el intermediario. El documento PDF se envía directamente a **Gemini 2.5 Flash** en Vertex AI. El modelo tiene "visión" nativa: "lee" el PDF y devuelve el texto puro. Esto aumenta drásticamente la tasa de éxito (cero errores de extracción) y traslada la carga de cómputo pesada del servidor web a la infraestructura dedicada de IA de Google.

---

## 4. Visión Hacia el Estándar Corporativo (Enterprise Readiness)

Para que este MVP (Producto Mínimo Viable) sea adoptado por una empresa corporativa con estrictos protocolos de TI, el sistema debe evolucionar en cuatro pilares (Visión a futuro):

### A. MLOps (Operaciones de Machine Learning)
En una empresa, los *prompts* (instrucciones a la IA) son activos de negocio, no simples líneas de código.
*   **Gestión:** Utilizar gestores como *Vertex AI Prompt Management* para versionar los prompts.
*   **Evaluación:** Crear un "Golden Dataset" (CVs de prueba con evaluaciones correctas) para testear automáticamente si cambiar de Gemini 2.5 a 3.0 mejora o empeora los resultados.

### B. DevOps & CI/CD
El despliegue manual desde la terminal de un desarrollador es inaceptable en *Enterprise*.
*   Se debe implementar un pipeline (ej. GitHub Actions o Cloud Build) que construya y despliegue la imagen automáticamente tras aprobar una *Pull Request* (revisión de código por pares).

### C. Ciberseguridad
Manejo de datos altamente sensibles (PII).
*   **Secretos:** Mover variables de entorno (Claves de BD) a **GCP Secret Manager**.
*   **Redes Privadas:** Utilizar *VPC Service Controls* para que los CVs en Cloud Storage solo sean accesibles por la API interna, bloqueando descargas públicas.

### D. Observabilidad y FinOps
*   **Monitorización:** Dashboards en Cloud Logging para medir la latencia de la IA y configurar alarmas.
*   **Finanzas:** Alertas de presupuesto automáticas para evitar sobrecostes si hay un pico masivo de análisis de currículums.
