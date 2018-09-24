FROM node:8.12.0-alpine
WORKDIR /usr/src/reddit-clone

COPY ["package.json", "yarn.lock", "/usr/src/reddit-clone/"]
RUN yarn install --production
COPY src /usr/src/reddit-clone/src

EXPOSE 8080
CMD ["node", "src/index.js"]
