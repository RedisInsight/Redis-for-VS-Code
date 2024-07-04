FROM node:18.20.1-alpine

WORKDIR /app

COPY package.json .
RUN yarn add express fs-extra
COPY . .

CMD ["node", "static.ts"]
