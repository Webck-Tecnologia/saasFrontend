# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia arquivos do projeto
COPY . .

# Constrói o projeto
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala o vite e outras dependências necessárias para o preview
RUN npm install vite @vitejs/plugin-react

# Copia os arquivos buildados
COPY --from=builder /app/dist ./dist

EXPOSE 4173

# Inicia o servidor de preview do Vite
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
