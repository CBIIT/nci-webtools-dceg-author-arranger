# Stage 1: Build the Angular application
FROM node:14-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (without NODE_OPTIONS)
RUN npm install

# Copy project files
COPY . .

# Build the application with NODE_OPTIONS set
RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy custom nginx config (optional)
# COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]