FROM node:8.12.0-alpine
WORKDIR /usr/src/reddit-clone

COPY ["package.json", "yarn.lock", "/usr/src/reddit-clone/"]
RUN yarn install --production
COPY ["index.js", "src/", "/usr/src/reddit-clone/"]

EXPOSE 8080
CMD ["node", "index.js"]