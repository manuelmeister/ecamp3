# build stage
FROM node:14.16.1@sha256:8eb45f4677c813ad08cef8522254640aa6a1800e75a9c213a0a651f6f3564189 AS build-stage

COPY common /common

WORKDIR /app
COPY print .

RUN npm ci
RUN npm run build

# production stage
FROM node:14.16.1@sha256:8eb45f4677c813ad08cef8522254640aa6a1800e75a9c213a0a651f6f3564189 AS production-stage
WORKDIR /app

COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/.nuxt ./.nuxt
COPY --from=build-stage /app/static ./static
COPY print/nuxt.config.js .

ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 80

EXPOSE 80
CMD ./node_modules/.bin/nuxt start
