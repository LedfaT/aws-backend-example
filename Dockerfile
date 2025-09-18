# базовый образ:
    FROM node:20-alpine

    # создаём каталог приложения внутри контейнера:
    RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app
    
    # переходим в каталог приложения:
    WORKDIR /usr/src/app
    
    # копируем только package.json и package-lock.json
    COPY package*.json ./
    
    RUN apk add --no-cache coreutils
    
    # устанавливаем npm-зависимости
    RUN npm install
        
    # копируем остальной код приложения
    COPY . .
    
    # «выставляем наружу» порт веб-сервера
    EXPOSE 3000
    
    CMD ["sh", "-c", "npm run start"]