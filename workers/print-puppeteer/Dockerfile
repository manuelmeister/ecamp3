# A minimal Docker image with Node and Puppeteer
#
# Initially based upon:
# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker

FROM node:16.13.0-buster-slim@sha256:a5eecf2ee53935cb7974dfff42260d97289d61be9d7a2062c693be93c0cdcd7a
WORKDIR /app
RUN npm install
EXPOSE 3010