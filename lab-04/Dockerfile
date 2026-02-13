# Use official Node.js runtime as the base image
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists) to the container
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application code and scripts
COPY app.js ./
COPY scripts/ ./scripts/

# Expose the port the app runs on
EXPOSE 3000

# Default: run init script then start app (overridden by docker-compose for migration-only runs)
CMD ["node", "app.js"]
