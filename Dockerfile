FROM node:18-alpine as node
RUN apk add --no-cache git
WORKDIR /app
COPY . /app
#RUN yarn install && APP_ENV=production yarn run build
#RUN cp /app/dist/dbp-dispatch.html /app/dist/index.html

RUN yarn install && yarn run build

RUN export path=/; cp ./app-template public -R
#RUN export path=/; cp ./app-template public -R && cd public && \
#    sed -i 's|="/|="'"$path"'/|g' index.html && \
#    sed -i "s|from '/|from '$path/|g" index.html && \
#    sed -i 's|@import "/|@import "'"$path"'/|g' index.html && \
#    sed -i 's|: "/|: "'"$path"'/|g' index.html && \
#    sed -i 's| /| '"$path"'/|g' .htaccess && \
#    sed -i 's|="/|="'"$path"'/|g' browserconfig.xml || true && \
#    sed -i 's|"path": "/|"path": "'"$path"'/|g' topic.metadata.json

FROM httpd:latest
#COPY --from=node /app/dist /usr/local/apache2/htdocs
COPY --from=node /app/public /usr/local/apache2/htdocs
COPY --from=node /app/dist /usr/local/apache2/htdocs/app
