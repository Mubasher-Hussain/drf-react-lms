FROM node:13.12.0-alpine
WORKDIR /app/frontend
COPY package.json package-lock.json ./
#RUN npm install -g npm@latest
#RUN npm i --package-lock-only
RUN npm install
COPY . ./
EXPOSE 3000
CMD ["npm", "start"]