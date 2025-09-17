
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --silent

COPY . .

RUN npm run build

RUN npm prune --production

EXPOSE 3080

RUN chown -R node /usr/src/app
USER node

CMD ["npm", "run", "preview", "--", "--port", "3080", "--host"]
