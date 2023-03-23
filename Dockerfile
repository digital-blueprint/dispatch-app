FROM node:18-alpine as node
RUN apk add --no-cache git
WORKDIR /app
COPY . /app
RUN yarn install && APP_ENV=production yarn run build
RUN cp /app/dist/dbp-dispatch.html /app/dist/index.html

FROM httpd:latest
COPY --from=node /app/dist /usr/local/apache2/htdocs
