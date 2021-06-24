FROM node:14.5.0-alpine3.12
ARG PORT
ARG WEB_MEMORY

WORKDIR /app

COPY package.json .
RUN npm install

COPY index.js .
COPY auth.js .
COPY user.js .
COPY views ./views
COPY heroku-node.sh .
RUN ["chmod", "+x", "heroku-node.sh"]

EXPOSE ${PORT}

CMD ["./heroku-node.sh", "index.js"]