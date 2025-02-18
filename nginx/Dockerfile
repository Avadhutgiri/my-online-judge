# Use the official Nginx Alpine image as the base
FROM nginx:alpine

# Install OpenSSL
RUN apk --no-cache add openssl

# Remove the default Nginx config file
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration file into the container
COPY nginx.conf /etc/nginx/conf.d/

# Expose the necessary ports (80 for HTTP and 443 for HTTPS)
EXPOSE 80 443

# Run Nginx in the foreground (necessary for Docker containers)
CMD ["nginx", "-g", "daemon off;"]