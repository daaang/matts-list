FROM docker.io/library/node:19.6.1 as base

WORKDIR /usr/src/app
COPY .node-version package.json yarn.lock ./
RUN node --version | sed -e 's/^v//' > /tmp/node-version \
      && diff .node-version /tmp/node-version \
      && apt-get update \
      && yarn install
COPY ./public public/
COPY ./src src/

FROM base AS test
RUN mkdir /tmp/node /tmp/node/cache /tmp/node/coverage \
      && chmod -R 1777 /tmp/node \
      && ln -s /tmp/node/cache node_modules/.cache \
      && ln -s /tmp/node/coverage coverage \
      && useradd -d /tmp nonquem

# CI=true means yarn test exits on completion
ENV CI="true"
USER nonquem
CMD npx standard && yarn test --verbose --coverage

FROM base AS build
# CI=true means yarn build fails when there are warnings
ENV CI="true"
RUN npx standard && yarn build

FROM docker.io/library/nginx:1.23.2
ENV NGINX_PORT=8080
COPY ./nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /usr/src/app/build /usr/share/nginx/html/
