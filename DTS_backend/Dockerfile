# FROM node:16-alpine

# WORKDIR /sdl-backend

# COPY . .

# RUN npm install

# EXPOSE 3000

# CMD ["npm", "start"]


FROM node:20.7.0

WORKDIR /DTS_backend

COPY package*.json ./

COPY . /DTS_backend

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]