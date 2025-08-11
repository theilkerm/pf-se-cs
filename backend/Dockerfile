# Use a lightweight Node.js image based on Node.js 18
FROM node:18-bookworm-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Expose the port the app will run on
EXPOSE 3001

# Command to run the application in development mode with hot-reloading
CMD ["npm", "run", "dev"]