# Snap7 Express Server

A simple node.js express REST server to write to a siemens logo.

## Usage

One enpoint to open the gate.

```bash
curl --location --request GET 'http://localhost:3000' --header 'Authorization: Basic YWRtaW46c3VwZXJib2Nr'
```

The server has basic authentification implemented.

## Development

First install node.js, then run `npm install` inside of the project folder.
Moreover, create a `.env` file with your configurations. 

To start the server run `npm start` or `node index.js`.

## Raspberry Pi Setup

### Install Nnode

Don't use the official Raspbian node version. Instead install node manually. 

Get the link of the most recent version from 
```
https://nodejs.org/en/download/
```

Get the installer for ARMv7 (Raspberry Pi I is not supported).
```
wget https://nodejs.org/dist/v12.16.1/node-v12.16.1-linux-armv7l.tar.gz
```

Extract the file. Please make sure to change the filename.
```
tar -xzf node-v12.16.1-linux-armv7l.tar.gz
```

Change to the archive folder and cop Node to /usr/local
```
cd node-v12.16.1-linux-armv7l
sudo cp -R * /usr/local
```

