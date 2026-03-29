# ==========================================
# STAGE 1: Construcción de la PWA (React)
# ==========================================
FROM node:18.14.2-alpine3.17 AS builder

WORKDIR /app/web

# 1. Copiamos los listados de dependencias primero para cacheo de Docker
COPY web/package*.json ./
RUN npm ci

# 2. Copiamos el resto del código del front y generamos el build
COPY web/ ./
RUN npm run build

# ==========================================
# STAGE 2: Backend y Runtime de Producción
# ==========================================
FROM node:18.14.2-alpine3.17 AS production

# Optimización: Le decimos a Express y React que estamos en producción
ENV NODE_ENV=production

WORKDIR /app/api

# 1. Copiar lockfiles de la api
COPY api/package*.json ./

# 2. Instalar SÓLO dependencias de producción (omite jest, nodemon, etc)
RUN npm install --omit=dev

# 3. Copiar el código fuente de la API
COPY api/ ./

# 4. Copiar los estáticos de la PWA desde el Builder anterior
COPY --from=builder /app/web/build ./public/

# El puerto interno que Fly espera por el fly.toml
EXPOSE 8080

CMD ["npm", "start"]