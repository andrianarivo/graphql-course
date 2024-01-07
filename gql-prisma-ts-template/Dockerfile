FROM node:20.10-bookworm
ARG NODE_ENV=production
RUN npm i -g dotenv-cli
COPY package.json /home/node/app/
WORKDIR /home/node/app
RUN npm install
COPY ./ /home/node/app
EXPOSE 4000
CMD npm start
