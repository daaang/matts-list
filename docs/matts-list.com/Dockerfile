FROM docker.io/library/nginx:1.21
COPY web/public/favicon.ico /usr/share/nginx/html/
COPY docs/matts-list.com /usr/share/nginx/html/
RUN rm /usr/share/nginx/html/Dockerfile && sed -i -e "s/80;/8081;/" /etc/nginx/conf.d/default.conf
