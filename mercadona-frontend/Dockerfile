# ════════════════════════════════════════════════════════════
# STAGE 1: Build — Compila React con Vite
# ════════════════════════════════════════════════════════════
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# ════════════════════════════════════════════════════════════
# STAGE 2: Serve — Servidor estático ligero (sin Nginx)
# ════════════════════════════════════════════════════════════
FROM node:20-alpine

RUN npm install -g serve

COPY --from=build /app/dist /app/dist

EXPOSE 8099

# serve -s = modo SPA (redirige todas las rutas a index.html)
# -l 8099 = escucha en puerto 8099
CMD ["serve", "-s", "/app/dist", "-l", "8099"]