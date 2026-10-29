FROM node:22-alpine
ENV NODE_ENV=production PORT=5000
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
EXPOSE 5000
USER node
CMD ["npm", "start"]
