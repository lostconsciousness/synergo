FROM node:21

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY . .

RUN npm install --legacy-peer-deps

CMD ["npm", "run", "start:dev:task"]

