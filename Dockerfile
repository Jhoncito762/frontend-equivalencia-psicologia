# Usa una imagen base oficial de Node.js
FROM node:22-alpine

# Instala dependencias necesarias para lightningcss y otras librerías nativas
RUN apk add --no-cache libc6-compat python3 make g++

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el package.json y package-lock.json
COPY package.json package-lock.json* ./

# Instala las dependencias
RUN npm install --frozen-lockfile

# Copia el resto del código de la aplicación
COPY . .

# Compila la aplicación Next.js
RUN npm run build

# Expone el puerto que usa la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
