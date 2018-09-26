FROM node:8.12.0-alpine as builder
WORKDIR /app

# Install required dependencies
COPY yarn.lock .
COPY package.json .
COPY packages/front-end/package.json packages/front-end/package.json
RUN yarn install --frozen-lockfile

# Copy the required configuration files
COPY lerna.json .
COPY ["packages/front-end/webpack.config.js", "packages/front-end/.babelrc", "packages/front-end/"]

# Copy the source folder and compile it
COPY packages/front-end/src packages/front-end/src
RUN yarn run compile

# Create the runtime image
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/packages/front-end/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
