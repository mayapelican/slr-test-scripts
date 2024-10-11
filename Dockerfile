# Use the official Node.js 20 lts image as the base image
FROM node:20.14.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code to the container
COPY . .

# Expose the port your Nest.js application is listening on
EXPOSE 3337

# Command to start your Nest.js application
CMD [ "npm", "run", "start" ]
