# Bot needs to be built prior to building this image.

FROM node:12

WORKDIR /opt/app

COPY package*.json ./

RUN npm ci --only=prod

# These are added here as a way to define which env variables will be used.
ENV DISCORD_TOKEN ""
ENV PREFIX ""
ENV OWNER_ID ""
ENV INVITE_URL ""

COPY . .

VOLUME /opt/app/data

CMD ["npm", "start"]
