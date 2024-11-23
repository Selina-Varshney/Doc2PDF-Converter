
FROM node:16-bullseye


WORKDIR /app


COPY package*.json ./


RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && npm install \
    && apt-get clean


COPY . .


EXPOSE 3000


CMD ["npm", "start"]
