FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Default to the index server; overridden per-service in docker-compose
CMD ["node", "index.js"]
