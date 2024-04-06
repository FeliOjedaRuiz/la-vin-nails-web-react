FROM node:18.14.2-alpine3.17

WORKDIR /app

COPY ./web ./web
COPY ./api ./api

WORKDIR /app/web
RUN npm i
RUN npm run build
RUN mv /app/web/build /app/api/public

WORKDIR /app/api
RUN npm i

CMD ["npm", "start"]