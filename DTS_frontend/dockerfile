FROM node:16
WORKDIR /app
COPY package.json .
RUN npm install
RUN mkdir node_modules/.vite && chmod -R 777 node_modules/.vite
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]