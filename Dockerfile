# Build Stage
FROM node:12.20.0-alpine3.12 AS build

RUN apk add --no-cache git

WORKDIR /opt/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Bot Image
FROM node:12.20.0-alpine3.12

ARG DATE_CREATED
ARG VERSION

LABEL org.opencontainers.image.created=$DATE_CREATED
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.authors="Greencoast Studios"
LABEL org.opencontainers.image.vendor="Greencoast Studios"
LABEL org.opencontainers.image.title="Discord Support Tickets"
LABEL org.opencontainers.image.description="A support ticket bot for Discord."
LABEL org.opencontainers.image.documentation="https://github.com/greencoast-studios/discord-support-tickets/wiki"
LABEL org.opencontainers.image.source="https://github.com/greencoast-studios/discord-support-tickets"

RUN apk add --no-cache git

WORKDIR /opt/app

COPY package*.json ./
COPY ./Dockerfile ./README.md ./LICENSE ./

RUN npm ci --only=prod

# These are added here as a way to define which env variables will be used.
ENV DISCORD_TOKEN ""
ENV PREFIX ""
ENV OWNER_ID ""
ENV INVITE_URL ""

COPY --from=build /opt/app/build ./build

VOLUME /opt/app/data /opt/app/log

CMD ["npm", "start"]
