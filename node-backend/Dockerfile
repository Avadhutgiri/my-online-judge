# Use Node.js base image
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Install build dependencies and nodemon
RUN apt-get update && \
    apt-get install -y build-essential libc6-dev && \
    npm install -g nodemon

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Command will be overridden by docker-compose
CMD ["npx", "nodemon", "server.js"]