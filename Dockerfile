FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json .
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json .
RUN npm ci
COPY backend/ ./
RUN npm run build
RUN npm prune --omit=dev
COPY --from=frontend-builder /app/dist ./frontend
EXPOSE 3000
CMD ["npm", "start"]