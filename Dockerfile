FROM node:12-alpine

# Installs latest Chromium (73) package.
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge=73.0.3683.103-r0 \
      nss@edge \
      freetype@edge \
      harfbuzz@edge \
      ttf-freefont@edge

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
# Useless if "yarn add" is not made here
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser node pptruser \
    && mkdir -p /home/node/Downloads

# Run everything after as node user
USER node
