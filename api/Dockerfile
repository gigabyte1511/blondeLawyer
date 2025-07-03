FROM node:20.11-bookworm

WORKDIR /var/app

COPY package.json /var/app/

COPY babel.config.json /var/app/

COPY config /var/app/config/

RUN npm install

RUN apt-get update && apt-get install -y docker.io

COPY . .

# RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]

# ENTRYPOINT ["node", "./build/app/index.js"]
