
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production --silent

COPY . .

EXPOSE 8080

RUN chown -R node /usr/src/app
USER node

CMD ["npm", "start"]
