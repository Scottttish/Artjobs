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

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
