# Logo Mock

A simple emulator for Siemens Logo allowing the Snap7 Express Server to run without a real Logo device.

## Development
First install Snap7 lib, which could be downloaded  from ```https://sourceforge.net/projects/snap7/files/``. Use the most recent version of Snap7.

```
$ wget https://downloads.sourceforge.net/project/snap7/Snap7-IoT/snap7-iot-arm/snap7-iot-arm-1.4.2.tar.gz
$ tar -xzf snap7-full-1.4.2.tar.gz
$ cd snap7-full-1.4.2
$ cd build/unix
$ make -f arm_v7_linux.mk
$ sudo make -f arm_v7_linux.mk install
```

Then install snap7 python wrapper. Make sure to install as sudo, as the server must run on port 102, which is a priviledged port and thus the server has to be started as root.

Install pip3

```
$ sudo apt-get install python3-pip
```

```
$ sudo pip3 install python-snap7
```

## Config

Copy the example config and adapt the Slack hook.

```
$ cp logo-mock.ini.example logo-mock.ini
```

## Usage

Start the mock server.

```
$ sudo python3 logo-mock.py
```

To stop the server just press ```ctrl + c```.
