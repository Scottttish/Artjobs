FROM node:18 AS build
WORKDIR /app

USER root

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY src ./src
COPY public ./public
RUN chmod +x node_modules/.bin/react-scripts

RUN npm run build

FROM node:18-slim
WORKDIR /app

COPY --from=build /app/build ./build
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
