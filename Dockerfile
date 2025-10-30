# Usa una imagen base oficial de Node.js con Debian
FROM node:22-slim

# Instala herramientas de compilación necesarias para paquetes nativos
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y package-lock.json
COPY package.json package-lock.json* ./

# Instala las dependencias
RUN npm install --frozen-lockfile

# Reconstruir paquetes nativos para la arquitectura correcta
RUN npm rebuild lightningcss

# Copia el resto del código de la aplicación
COPY . .

# Compila la aplicación Next.js
RUN npm run build

# Expone el puerto que usa la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
