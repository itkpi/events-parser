FROM node:latest
MAINTAINER Maksym Vlasov <m.vlasov@post.com>
LABEL Name=events-parser Version=0.5.1 
COPY package.json /tmp/package.json
RUN cd /tmp && npm install --production
RUN mkdir -p /usr/src/app && mv /tmp/node_modules /usr/src
WORKDIR /usr/src/app
COPY . /usr/src/app
EXPOSE 3000
CMD node main.js
