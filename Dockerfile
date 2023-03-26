FROM node:18-alpine as ts-compiler

WORKDIR /usr/app

RUN apk add curl
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY package*.json ./
COPY tsconfig*.json ./

RUN pnpm install

COPY . ./

RUN pnpm build


FROM node:18-alpine as ts-remover

WORKDIR /usr/app

RUN apk add curl
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY --from=ts-compiler /usr/app/package*.json ./
COPY --from=ts-compiler /usr/app/build ./
COPY pnpm-lock.yaml ./

RUN pnpm install --production

FROM gcr.io/distroless/nodejs:18

WORKDIR /usr/app

COPY --from=ts-remover /usr/app ./

USER 1000

ENV GHOST_API_KEY=$GHOST_API_KEY
ENV GHOST_URL=$GHOST_URL
ENV LOGO_URL=$LOGO_URL

CMD ["cli.js", "watch", "$RSS_FEED", "300000"]