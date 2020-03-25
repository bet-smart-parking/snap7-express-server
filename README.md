# Snap7 Express Server

A simple node.js express REST server to write to a siemens logo.

## Usage

One enpoint to open the gate.

```bash
$ curl --location --request GET 'http://localhost:3000' --header 'Authorization: Basic YWRtaW46c3VwZXJib2Nr'
```

The server has basic authentification implemented.

## Development

First install node.js, then run `npm install` inside of the project folder.
Moreover, create a `.env` file with your configurations. 

To start the server run `npm start` or `node index.js`.

## Raspberry Pi Setup

### Setup raspbian

Get the official raspbian release from 

```
$ https://www.raspberrypi.org/downloads/raspbian/
```

#### Hint: Headless installation

Place the following files in /boot of the SD card 

* empty file ```ssh``` to use ssh
* ```wpa_supplicant.conf``` to setup your wifi
```
country=US # Your 2-digit country code
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
network={
    ssid="YOUR_NETWORK_NAME"
    psk="YOUR_PASSWORD"
    key_mgmt=WPA-PSK
}
```


### Install Node

Don't use the official Raspbian node version. Instead install node manually. 

Get the link of the most recent version from 
```
https://nodejs.org/en/download/
```

Get the installer for ARMv7 (Raspberry Pi I is not supported).
```
$ wget https://nodejs.org/dist/v12.16.1/node-v12.16.1-linux-armv7l.tar.gz
```

Extract the file. Please make sure to change the filename.
```
$ tar -xzf node-v12.16.1-linux-armv7l.tar.gz
```

Change to the archive folder and cop Node to /usr/local
```
$ cd node-v12.16.1-linux-armv7l
$ sudo cp -R * /usr/local
```

### Installing PM2

To deamonize the gateway application we us PM2. This allows us to start the gateway application in the background as a service.

```
$ sudo npm install pm2@latest -g
```
This will install pm2 globally.

### Install Snap7 Express Server

Install the node.js express REST server in ```/var```

```
$ sudo mkdir /var/node
$ sudo chown pi.pi /var/node
$ cd /var/node
$ wget https://github.com/bet-smart-parking/snap7-express-server/archive/master.zip
$ unzip master.zip
$ npm install
```

Then configure ```.env``` File according to your system. ```PLC_IP``` is the address of the LOGO!8 box. 

### Run Snap7 Express Server as Service

Run the server through PM2
```
$ pm2 start index.js
```

Run PM2 on system startup
```
$ pm2 startup systemd
```
Copy the last line of the output and run it with superuser priviledges
```
$ sudo env PATH=$PATH:/usr/local/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
```
