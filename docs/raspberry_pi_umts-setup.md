# Establishing a Raspberry Pi PPP link with the SIM7600 UMTS hat

The PPP (Point-to-Point Protocol) link allows the Raspberry Pi with a 3G/4G hat to access a cellular network.

- [SIM7600CE Manual](https://www.waveshare.com/w/upload/6/6d/SIM7600E-H-4G-HAT-Manual-EN.pdf)
- [SIM7600CE Wiki](https://www.waveshare.com/wiki/SIM7600E-H_4G_HAT)
- [PPP Wikipedia](https://en.wikipedia.org/wiki/Point-to-Point_Protocol)
- [Digital Republic APN](
https://support.digitalrepublic.ch/en/support/solutions/articles/33000225322-flex-subscription-apn-configuration-android-devices)


## Set up serial connection
First, make sure no SIM card password is set. This can be achieved by disabling it while its inserted in your mobile phone. Insert the SIM card into the SIM7600, attach the antenna and install the standoffs included in the box (otherwise the hat sags if only attached via GPIO pins on one side). Mount the SIM7600 on the Raspberry Pi over GPIO. Make sure that the SIM7600's jumper wires on the right side are set to B, in the middle position. Otherwise the Raspberry Pi isn't set to communicate with the SIM7600 over serial.

![Module](https://www.waveshare.com/img/devkit/accBoard/SIM7600E-LTE-Cat-1-HAT/SIM7600E-LTE-Cat-1-HAT-19_960.jpg)

SSH into RPi over Wifi and pubkey or log in using a monitor and keyboard. The former makes things easier unless you want to type whole config files manually. Ensure in the boot/config.txt file that UART is enabled, the default Parcandi image already had this

```sh
sudo nano /boot/config.txt
```
Enable UART using the following line
```
enable_uart=1
```

Next, in raspi config change serial settings so that serial login is disabled, but overall serial is enabled.

```sh
sudo raspi-config

# then under (5) interfacing options / (P6) Serial first say No to "Would you like a login shell to be accessible over serial" and next say yes to "Would you like the serial port hardware to be enabled"
```

Create the file "simPinBindings", enter the following to set pin bindings

```sh
sudo nano ~/simPinBindings
```

```sh
# filename simPinBindings
echo "4" > /sys/class/gpio/export
sleep 0.1
echo "out" > /sys/class/gpio/gpio4/direction
echo "0" > /sys/class/gpio/gpio4/value
echo "6" > /sys/class/gpio/export
sleep 0.1
echo "out" > /sys/class/gpio/gpio6/direction
echo "0" > /sys/class/gpio/gpio6/value
```
make file executable
```sh
sudo chmod 777 simPinBindings
```

On boot, ensure bindings are set by editing the /etc/rc.local file

```sh
sudo nano /etc/rc.local
```

Insert line

```sh
sh /home/pi/simPinBindings
```

reboot

## Test Serial Connection

Install Minicom to write into serial device

```sh
sudo apt-get install minicom
```

Issue [AT commands](https://en.wikipedia.org/wiki/Hayes_command_set) into the SIM7600 (serial device /dev/ttyS0) using
```sh
sudo minicom -D /dev/ttyS0
```

Now you can test whether the SIM7600 is successfully configured to be written into via serial with the following commands. AT+XXX is always followed by expected output.

```SH
AT
OK

ATI
Manufacturer: SIMCOM INCORPORATED
Model: SIMCOM_SIM7600E-H
Revision: SIM7600M22_V1.1
IMEI: 867584034313614
+GCAP: +CGSM

# test signal strength
AT+CSQ
+CSQ: 19,99

AT+CPSI?
+CPSI: LTE,Online,228-02,0x9CA4,20964868,46,EUTRAN-BAND20,6200,3,3,-178,-1089,-742,8
```

Exit minicom using CTRL+A+Z and x for exit.

## Set up PPP link
Digital republic APN according to [Docs](
https://support.digitalrepublic.ch/en/support/solutions/articles/33000225322-flex-subscription-apn-configuration-android-devices) is dr.m2m.ch

Install ppp, afterwards switch user to root and enter '/etc/ppp/peers/' directory

```sh
sudo apt-get install ppp
sudo su - root
cd /etc/ppp/peers/
```

```sh
# create new file named parcandi
nano parcandi
```

Paste the following in this file, replacing dr.m2m.ch with your APN and /dev/ttyS0 with serial connection file.

```sh
# Example PPPD configuration for FONA GPRS connection on Debian/Ubuntu.

# MUST CHANGE: Change the -T parameter value **** to your network's APN value.
# For example if your APN is 'internet' (without quotes), the line would look like:
# connect "/usr/sbin/chat -v -f /etc/chatscripts/gprs -T internet"
connect "/usr/sbin/chat -v -f /etc/chatscripts/gprs -T dr.m2m.ch"

# For Raspberry Pi use /dev/ttyAMA0 by uncommenting the line below:
/dev/ttyS0

# Speed of the serial line.
115200

# Assumes that your IP address is allocated dynamically by the ISP.
noipdefault

# Try to get the name server addresses from the ISP.
usepeerdns

# Use this connection as the default route to the internet.
defaultroute

# Makes PPPD "dial again" when the connection is lost.
persist

# Do not ask the remote to authenticate.
noauth

# No hardware flow control on the serial link with FONA
nocrtscts

# No modem control lines with FONA.
local
```

Exit root user.

## Automatic PPP Connection On Boot
To automatically bring up the PPP connection on boot, update the network configuration. First make sure you've verified you can manually bring up the PPP connection using

```sh
sudo pon parcandi

ifconfig
# if device PPP0 is available and google.com is pingable,

# turn off again with
sudo poff parcandi
```

If everything is okay, edit the /etc/network/interfaces file by executing:

```sh
sudo nano /etc/network/interfaces
```

```
auto parcandi
iface parcandi inet ppp
	provider parcandi
```
This configuration will tell your device to bring up the PPP peer automatically on boot. The configuration previously set in /etc/ppp/peers/parcandi will be used to set up the PPP connection.

The raspberry pi is set to retry to establish the connection once a minute indefinitely if it is broken.

## Disable Wifi
Disable Wifi to ensure that PPP0 is always selected as network interface. Remember that all SSH connections over Wifi will be disabled on reboot.

```sh
sudo nano /boot/config.txt
```
Disable wifi
```
dtoverlay=disable-wifi
```


## Troubleshooting

Using the config introduced in the previous section, the RPi retries to establish a PPP link once a minute if it is lost. If the device just freshly booted, it might take a minute for a PPP connection to be made.

If issues persist, check the PPPD log files using
```sh
cat /var/log/syslog | grep pppd
```

Perhaps the SIM7600 is misconfigured and the RPi cannot communicate with it over serial. To get an idea of how PPP is trying to interface with the SIM7600 over serial, execute the following
```sh
cat /var/log/syslog | grep chat
```
Another clear sign that something is wrong is when the NET LED below the PWR LED on the SIM7600 is not turned on. Then the net button manually has to be pressed. Check if Wifi is disabled if this is the case, as outlined in "Set up serial connection". Attaching a USB cable between RPi and SIM7600 can prevent the RPi from booting, so avoid this.

## Test 1: show ifconfig
```sh
$ ifconfig
ppp0: flags=4305<UP,POINTOPOINT,RUNNING,NOARP,MULTICAST>  mtu 1500
        inet 10.147.178.83  netmask 255.255.255.255  destination 10.64.64.64
        ppp  txqueuelen 3  (Point-to-Point Protocol)
        RX packets 5  bytes 62 (62.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 6  bytes 101 (101.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

ping -I ppp0 8.8.8.8
```

## Test 2: list connection profiles in SIM7600
```sh
sudo minicom -D /dev/ttyS0

AT+CGDCONT?
+CGDCONT: 1,"IP","dr.m2m.ch","0.0.0.0",0,0,0,0
+CGDCONT: 2,"IPV4V6","ims","0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0",0,0,0,0
+CGDCONT: 3,"IPV4V6","","0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0",0,0,0,1
+CGDCONT: 4,"IPV4V6","","0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0",0,0,0,0
+CGDCONT: 5,"IPV4V6","","0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0",0,0,0,0
+CGDCONT: 6,"IPV4V6","ctlte","0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0",0,0,0,0
```
