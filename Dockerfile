# Use the official Node.js LTS image from DockerHub
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for layer caching)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy all other files (your app code)
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Run the application
CMD ["node", "src/app.js"]
