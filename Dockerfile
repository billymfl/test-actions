FROM node:10.16.3-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

EXPOSE 80

ENTRYPOINT ["npm", "start"]