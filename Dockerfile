# Usa Bun sobre Debian para construir (tiene glibc, no musl)
FROM oven/bun:1-debian AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json bun.lockb* ./

# Instalar dependencias
RUN bun install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Compilar la aplicación Next.js
RUN bun run build

# Etapa de producción
FROM oven/bun:1-debian AS runner

WORKDIR /app

# Copiar solo lo necesario desde builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb* ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Exponer el puerto 5000
EXPOSE 5000

# Variables de entorno
ENV PORT=5000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar la aplicación
CMD ["bun", "run", "start"]
