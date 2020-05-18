# Snap7 Express Server

A simple node.js express REST server to write to a siemens logo.

## Usage

One endpoint to open the gate.

```bash
$ curl --location --request GET 'http://localhost:3000' --header 'Authorization: Basic YWRtaW46c3VwZXJib2Nr'
```

The server has basic authentification implemented.

## Development

First install node.js, then run `npm install` inside of the project folder.
Moreover, create a `.env` file with your configurations. 

To start the server run `npm start` or `node index.js`.
