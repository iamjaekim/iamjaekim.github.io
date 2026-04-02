FROM node:20-bookworm-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Run build
RUN npm run build || true

EXPOSE 3000

# For local dev with Tilt, we'll override the command in Tiltfile if needed
CMD [ "npm", "run", "dev" ]
