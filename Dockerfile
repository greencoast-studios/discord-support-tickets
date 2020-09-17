FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci -only=prod

RUN npm run build

COPY . .

CMD ["npm", "start"]
