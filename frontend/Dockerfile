FROM node:lts-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install --silent
COPY . .
RUN npm run build

FROM node:lts-alpine as prod
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/index.html ./
COPY --from=build /app/public ./public

EXPOSE 3080
RUN chown -R node /usr/src/app
USER node

CMD ["npm", "run", "preview", "--", "--port", "3080", "--host"]
