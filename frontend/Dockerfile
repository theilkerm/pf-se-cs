# Next.js dev için, sharp vb. derleme sorunlarına takılmamak adına Debian tabanlı imaj
FROM node:20-bookworm-slim

WORKDIR /app
ENV NODE_ENV=development

# Bağımlılıkların cache’lenebilmesi için önce manifestleri kopyala
COPY package*.json ./

# Temiz kurulum
RUN npm ci

# Uygulama kaynakları
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
