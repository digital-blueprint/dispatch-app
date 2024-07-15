FROM node:20 as node
RUN apt-get update && apt-get install -y git
WORKDIR /app
COPY . /app
#COPY ./dist /app/dist
#COPY ./app-template /app/app-template

RUN npm ci && APP_ENV=production npm run build
#RUN cp /app/dist/dbp-dispatch.html /app/dist/index.html

#RUN export path=; cp ./app-template public -R && cd public && \
#    sed -i 's|="/|="'"$path"'/|g' index.html && \
#    sed -i "s|from '/|from '$path/|g" index.html && \
#    sed -i 's|@import "/|@import "'"$path"'/|g' index.html && \
#    sed -i 's|: "/|: "'"$path"'/|g' index.html && \
#    sed -i 's| /| '"$path"'/|g' .htaccess && \
#    sed -i 's|="/|="'"$path"'/|g' browserconfig.xml || true && \
#    sed -i 's|"path": "/|"path": "'"$path"'/|g' topic.metadata.json

FROM httpd:latest
#COPY --from=node /app/dist /usr/local/apache2/htdocs
COPY --from=node /app/app-template /usr/local/apache2/htdocs
COPY --from=node /app/dist /usr/local/apache2/htdocs/app
