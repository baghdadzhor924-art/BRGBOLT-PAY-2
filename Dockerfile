# Node with Playwright
FROM mcr.microsoft.com/playwright:v1.45.0-focal

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
ENV USE_PLAYWRIGHT=1

EXPOSE 3000
CMD ["node", "dist/server.js"]
