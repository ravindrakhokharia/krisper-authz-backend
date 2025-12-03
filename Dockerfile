# Use official Node.js image as the base
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Start the application in development mode
CMD ["npm", "run", "start:dev"]
