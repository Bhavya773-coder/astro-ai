# Multi-stage build for AstroAI Platform

# Frontend Build Stage
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY website/package*.json ./
RUN npm ci --only=production
COPY website/ ./
RUN npm run build

# Backend Build Stage
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY api-backend/package*.json ./
RUN npm ci --only=production
COPY api-backend/ ./

# Production Stage
FROM node:18-alpine AS production

# Install nginx for frontend serving
RUN apk add --no-cache nginx

# Copy frontend build
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# Copy backend
COPY --from=backend-build /app/backend /app/backend

# Configure nginx
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location /api { \
        proxy_pass http://localhost:5001; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80 5001

# Start both services
CMD ["sh", "-c", "cd /app/backend && npm start & nginx -g 'daemon off;'"]
