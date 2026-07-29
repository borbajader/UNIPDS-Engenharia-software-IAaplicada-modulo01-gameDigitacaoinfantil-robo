# =============================================================================
# DOCKERFILE VALIDADO - JOGO DE DIGITAÇÃO INFANTIL (ALFABETIZAÇÃO & ROBÔ IA)
# Multi-stage Build para Vite / React + Nginx Alpine
# =============================================================================

# Estágio 1: Compilação e Build de Produção
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração e dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci || npm install

# Copiar código-fonte completo (incluindo public/yolo-worker.js, index.html, src/)
COPY . .

# Executar o build estático de produção (gera a pasta dist/)
RUN npm run build

# -----------------------------------------------------------------------------
# Estágio 2: Servidor Web Nginx de Alta Performance e Baixo Consumo de Memória
# -----------------------------------------------------------------------------
FROM nginx:alpine

LABEL maintainer="Jogo Infantil <suporte@exemplo.com>"
LABEL description="Container Nginx de produção para o Jogo de Digitação Infantil com Robô IA TensorFlow.js"

# Remover conteúdo padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar os artefatos compilados do estágio de build (pasta dist/) para o Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor a porta padrão HTTP do Nginx
EXPOSE 80

# Comando para manter o Nginx rodando em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
