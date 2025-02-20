# Use the official Nginx Alpine image as the base
FROM nginx:alpine

# Install OpenSSL for SSL certificate handling
RUN apk --no-cache add openssl

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/

# Create directories for Let's Encrypt challenge responses
RUN mkdir -p /var/lib/letsencrypt/.well-known/acme-challenge
RUN chown -R nginx:nginx /var/lib/letsencrypt

# Expose ports for HTTP (80) and HTTPS (443)
EXPOSE 80 443

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
