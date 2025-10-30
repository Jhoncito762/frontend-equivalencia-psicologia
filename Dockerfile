# Usa una imagen base oficial de Bun
FROM oven/bun:1 AS builder

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y bun.lockb
COPY package.json bun.lockb* ./

# Instala las dependencias incluyendo binarios opcionales
RUN bun install --frozen-lockfile

# Copia el resto del código de la aplicación
COPY . .

# Compila la aplicación Next.js
RUN bun run build

# Expone el puerto que usa la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["bun", "run", "start"]
