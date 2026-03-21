# Stage 1: Build the Quasar SPA
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG BACKEND_BASE_URL=http://localhost
ENV BACKEND_BASE_URL=$BACKEND_BASE_URL

ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npx quasar build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist/spa /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
