# syntax=docker/dockerfile:experimental
FROM node:20-alpine

RUN sed -i 's/http\:\/\/dl-cdn.alpinelinux.org/https\:\/\/alpine.global.ssl.fastly.net/g' /etc/apk/repositories
RUN apk --no-cache add git curl openssh-client python3 make autoconf automake libtool g++
RUN mkdir -p /opt/app

WORKDIR /opt/app
COPY . .

RUN corepack enable
RUN yarn set version stable
RUN yarn install --immutable
RUN yarn build

CMD ["node", "/opt/app/dist/index.js"]
