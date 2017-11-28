FROM node:slim

# Create app directory
RUN mkdir -p /opt/src/app
WORKDIR /opt/src/app

# Install app dependencies
COPY package.json /opt/src/app/
Run cd /opt/src/app/
Run npm cache clean -f
Run npm install
Run node --version

# Bundle app source
COPY . /opt/src/app

EXPOSE 4000
CMD [ "npm", "start" ]
