# Stage 1: Build Stage
FROM node:20.11.1-alpine AS builder

# Metadata
LABEL maintainer="Kanwar Preet Kaur <kkaur531@myseneca.ca>"
LABEL description="Fragments Node.js microservice"

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY ./src ./src

# Copy the HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd


# Stage 2: Production Stage (Final Image)
FROM node:20.11.1-alpine

# Set working directory
WORKDIR /app

# Copy built application from the previous stage
COPY --from=builder /app /app

# Expose required port
EXPOSE 80

# Start the server
CMD ["npm", "start"]
