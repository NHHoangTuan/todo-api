FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

# Expose port
EXPOSE 3000

# Command run app
CMD ["node", "server.js"]