FROM node:20-alpine AS client-build

WORKDIR /client

COPY client/package*.json ./

RUN npm ci

COPY client/ ./

RUN npm run build


FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./

RUN npm ci --only=production

COPY server/ ./

RUN mkdir -p uploads

COPY --from=client-build /client/dist ./client/dist

EXPOSE 5000

CMD ["node", "src/app.js"]
