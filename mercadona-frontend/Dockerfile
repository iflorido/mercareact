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
# STAGE 2: Serve — Nginx sirve los estáticos
# ════════════════════════════════════════════════════════════
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8099

CMD ["nginx", "-g", "daemon off;"]