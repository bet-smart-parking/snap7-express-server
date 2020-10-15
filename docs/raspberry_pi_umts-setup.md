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

SSH into RPi. Ensure in the boot/config.txt file that UART is enabled, the default Parcandi image already had this

```sh
nano /boot/config.txt
```
If not already done, add the following to the end of the file.
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

On boot, ensure bindings are set by editing the /etc/rc.local file

```sh
sudo nano /etc/rc.local
```

Insert line

```sh
sh /home/pi/simPinBindings

# has to be before the exit 0 statement at eof
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

# enter twice
AT+CPSI?
ERROR

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

```sh
$ sudo pon parcandi
$ cat /var/log/syslog | grep pppd
Oct 15 07:59:49 prine-pi-1 pppd[1240]: pppd 2.4.7 started by root, uid 0
Oct 15 07:59:49 prine-pi-1 pppd[1240]: Serial connection established.
Oct 15 07:59:49 prine-pi-1 pppd[1240]: Using interface ppp0
Oct 15 07:59:49 prine-pi-1 pppd[1240]: Connect: ppp0 <--> /dev/ttyS0
Oct 15 07:59:50 prine-pi-1 pppd[1240]: PAP authentication succeeded
Oct 15 07:59:50 prine-pi-1 pppd[1240]: Could not determine remote IP address: defaulting to 10.64.64.64
Oct 15 07:59:50 prine-pi-1 pppd[1240]: not replacing default route to wlan0 [192.168.1.1]
Oct 15 07:59:50 prine-pi-1 pppd[1240]: local  IP address 10.147.178.83
Oct 15 07:59:50 prine-pi-1 pppd[1240]: remote IP address 10.64.64.64
Oct 15 07:59:50 prine-pi-1 pppd[1240]: primary   DNS address 10.200.102.244
Oct 15 07:59:50 prine-pi-1 pppd[1240]: secondary DNS address 10.200.102.243
```

Here is what the PPP script is actually instructing the SIM7600 to do in the background:
```
cat /var/log/syslog | grep chat
Oct 15 07:59:49 prine-pi-1 chat[1245]: abort on (BUSY)
Oct 15 07:59:49 prine-pi-1 chat[1245]: abort on (VOICE)
Oct 15 07:59:49 prine-pi-1 chat[1245]: abort on (NO CARRIER)
Oct 15 07:59:49 prine-pi-1 chat[1245]: abort on (NO DIALTONE)
Oct 15 07:59:49 prine-pi-1 chat[1245]: abort on (NO DIAL TONE)
Oct 15 07:59:49 prine-pi-1 chat[1245]: abort on (NO ANSWER)
Oct 15 07:59:49 prine-pi-1 chat[1245]: abort on (DELAYED)
Oct 15 07:59:49 prine-pi-1 chat[1245]: abort on (ERROR)
Oct 15 07:59:49 prine-pi-1 chat[1245]: abort on (+CGATT: 0)
Oct 15 07:59:49 prine-pi-1 chat[1245]: send (AT^M)
Oct 15 07:59:49 prine-pi-1 chat[1245]: timeout set to 12 seconds
Oct 15 07:59:49 prine-pi-1 chat[1245]: expect (OK)
Oct 15 07:59:49 prine-pi-1 chat[1245]: AT^M^M
Oct 15 07:59:49 prine-pi-1 chat[1245]: OK
Oct 15 07:59:49 prine-pi-1 chat[1245]:  -- got it
Oct 15 07:59:49 prine-pi-1 chat[1245]: send (ATH^M)
Oct 15 07:59:49 prine-pi-1 chat[1245]: expect (OK)
Oct 15 07:59:49 prine-pi-1 chat[1245]: ^M
Oct 15 07:59:49 prine-pi-1 chat[1245]: ATH^M^M
Oct 15 07:59:49 prine-pi-1 chat[1245]: OK
Oct 15 07:59:49 prine-pi-1 chat[1245]:  -- got it
Oct 15 07:59:49 prine-pi-1 chat[1245]: send (ATE1^M)
Oct 15 07:59:49 prine-pi-1 chat[1245]: expect (OK)
Oct 15 07:59:49 prine-pi-1 chat[1245]: ^M
Oct 15 07:59:49 prine-pi-1 chat[1245]: ATE1^M^M
Oct 15 07:59:49 prine-pi-1 chat[1245]: OK
Oct 15 07:59:49 prine-pi-1 chat[1245]:  -- got it
Oct 15 07:59:49 prine-pi-1 chat[1245]: send (AT+CGDCONT=1,"IP","dr.m2m.ch","",0,0^M)
Oct 15 07:59:49 prine-pi-1 chat[1245]: expect (OK)
Oct 15 07:59:49 prine-pi-1 chat[1245]: ^M
Oct 15 07:59:49 prine-pi-1 chat[1245]: AT+CGDCONT=1,"IP","dr.m2m.ch","",0,0^M^M
Oct 15 07:59:49 prine-pi-1 chat[1245]: OK
Oct 15 07:59:49 prine-pi-1 chat[1245]:  -- got it
Oct 15 07:59:49 prine-pi-1 chat[1245]: send (ATD*99#^M)
Oct 15 07:59:49 prine-pi-1 chat[1245]: timeout set to 22 seconds
Oct 15 07:59:49 prine-pi-1 chat[1245]: expect (CONNECT)
Oct 15 07:59:49 prine-pi-1 chat[1245]: ^M
Oct 15 07:59:49 prine-pi-1 chat[1245]: ATD*99#^M^M
Oct 15 07:59:49 prine-pi-1 chat[1245]: CONNECT
Oct 15 07:59:49 prine-pi-1 chat[1245]:  -- got it
Oct 15 07:59:49 prine-pi-1 chat[1245]: send (^M)
```
CONGRATS, you successfully connected to the internet using PPP and LTE.

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

## Automatic PPP Connection On Boot
If you'd like to configure your device to automatically bring up the PPP connection on boot, it's easy to do so by updating the network configuration. First make sure you've verified you can manually bring up the PPP connection in the previous steps.

Edit the /etc/network/interfaces file by executing:

```sh
sudo nano /etc/network/interfaces
```

```
auto parcandi
iface parcandi inet ppp
	provider parcandi
```
This configuration will tell your device to bring up the PPP peer automatically on boot. The configuration in /etc/ppp/peers/parcandi will be used to set up the PPP connection.
