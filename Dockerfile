FROM node:18 AS build
WORKDIR /app

USER root

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY src ./src
COPY public ./public
COPY nginx.conf ./
RUN chmod +x node_modules/.bin/react-scripts

RUN npm run build
