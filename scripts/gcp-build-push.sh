#!/bin/bash
# =============================================================================
# Script para subir imágenes de Vera a Artifact Registry (GCP)
# =============================================================================

PROJECT_ID="vera-serverless-20260505"
REGION="europe-west1"
REPO_NAME="vera-repo"
IMAGE_NAME="vera-api"
TAG="latest"

# 1. Configurar Docker para hablar con GCP (si no se ha hecho)
echo "Configurando autenticación de Docker con GCP..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# 2. Crear el repositorio si no existe
echo "Verificando repositorio en Artifact Registry..."
gcloud artifacts repositories create ${REPO_NAME} \
    --repository-format=docker \
    --location=${REGION} \
    --description="Repositorio para Vera Hiring Tracker" \
    --project=${PROJECT_ID} || echo "El repositorio ya existe."

# 3. Construir imágenes
echo "Construyendo imagen de la API (AMD64)..."
docker build --platform linux/amd64 -t vera-api:latest -f docker/Dockerfile --target api .

echo "Construyendo imagen de la WEB (AMD64)..."
# Inyectamos la URL de la API para que el frontend sepa a dónde llamar
docker build --platform linux/amd64 -t vera-web:latest -f docker/Dockerfile --target web .

# 4. Etiquetar y Subir
API_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/vera-api:latest"
WEB_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/vera-web:latest"

echo "Etiquetando y Subiendo API..."
docker tag vera-api:latest ${API_PATH}
docker push ${API_PATH}

echo "Etiquetando y Subiendo WEB..."
docker tag vera-web:latest ${WEB_PATH}
docker push ${WEB_PATH}

echo "✅ Imágenes subidas con éxito."
echo "Imagen lista en: ${FULL_IMAGE_PATH}"
