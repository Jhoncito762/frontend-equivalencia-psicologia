# Usa Bun sobre Debian (tiene glibc, no musl)
FROM oven/bun:1-debian AS builder

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .

# Compila la aplicación Next.js
RUN bun run build

EXPOSE 5000
ENV PORT=5000

CMD ["bun", "run", "start"]
