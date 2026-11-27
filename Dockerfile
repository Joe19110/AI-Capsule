# AI Capsule — container image for Fly.io
# Builds the React client and runs the Express server that serves both the API
# and the built client from a single port.

FROM node:20-slim

# better-sqlite3 is a native module; it needs build tools to compile on install.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install root dependencies. The root "postinstall" also installs client deps.
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm install

# Copy the rest of the source and build the React client into client/dist.
COPY . .
RUN npm run build

# The server reads PORT from the environment; Fly sets it. Default to 8080.
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]
