# Use Node.js official image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy the rest of the application code
COPY backend/ .

# Expose port and start the server
EXPOSE 5000
CMD [ "node", "server.js" ]
