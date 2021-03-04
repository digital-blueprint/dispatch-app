FROM nextcloud:20-apache
RUN apt-get update && apt-get install -y ghostscript && rm -rf /var/lib/{apt,dpkg,cache,log}/

COPY entrypoint.sh /

RUN deluser www-data
RUN useradd -u 1000 -ms /bin/bash www-data
RUN usermod -a -G www-data www-data
