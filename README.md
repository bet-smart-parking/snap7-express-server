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

## Configuration Parameters

```
PORT=3000
PLC_IP=127.0.0.1
PLC_DELAY_TO_RESET=1000
PLC_DATABASE=1
SERVERS=http://localhost:3000
```
- ```Port```: The port on which node should run the server
- ```PLC_IP```: The IP of the LOGO!8
- ```PLC_DELAY_TO_RESET```: Time in milliseconds until the reset command will be sent to LOGO!8
- ```PLC_DATABASE```: The Database number of LOGO!8
- ```SERVERS```: Array of snap7-express-servers which can be triggered through the swagger documentation

# Hardware

A detailed hardware installation guide can be found in [Hardware Installation Manual](./docs/hardware_installation.md "Hardware Installation Manual").

To setup the Snap7 Express Server on a Raspberry Pi please follow the step-by-step guide found in [Raspberry Pi Setup Instructions](./docs/raspberry_pi_setup_instructions.md "Raspberry Pi Setup Instructions").