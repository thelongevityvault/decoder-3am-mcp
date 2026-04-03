FROM node:20-slim
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src/ ./src/
COPY server.mjs ./
EXPOSE 3000
CMD ["node", "server.mjs"]
