FROM node:lts
# RUN apt update
# RUN apt install python chromium -y
# RUN apk add --no-cache chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.11/community
# RUN apk add python

RUN apt-get update
RUN apt-get -y install apt-transport-https ca-certificates curl gnupg2 software-properties-common
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN add-apt-repository "deb [arch=armhf] https://download.docker.com/linux/debian $(lsb_release -cs) stable"

RUN apt-get update
RUN apt-get -y install docker-ce-cli

WORKDIR /usr/src/app
COPY package*.json ./
RUN NPM_CONFIG_PRODUCTION=false npm install
COPY . .
RUN npm run build
CMD [ "npm", "run", "start" ]