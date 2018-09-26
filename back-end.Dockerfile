FROM node:8.12.0-alpine
WORKDIR /app

# Install required dependencies
COPY yarn.lock .
COPY package.json .
COPY packages/back-end/package.json packages/back-end/
RUN yarn install --production --frozen-lockfile

# Copy the source files
COPY packages/back-end/src/ packages/back-end/src/

# Expose the right port and run the server
EXPOSE 80
CMD ["node", "packages/back-end/src/index.js"]
