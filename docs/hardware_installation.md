# Gateway Hardware Installation Guide

Target audience: Electricians connecting the hardware together. For configuring the hardware, kindly refer to [Raspberry PI Setup Instructions](./raspberry_pi_setup_instructions.md)

## Installation with existing router

![Alt Hardware installation schematic drawing](./assets/images/gateway-hardware-installation.svg?sanitize=true)

The hardware to open the gate consists of two components:
* Siemens LOGO!8
* Raspberry Pi device ([recommended hardware](./hardware_recommendation.md))

### Wiring of Raspberry Pi
* The Raspberry Pi is connected to the internet router through port eth1, while the Siemens Logo!8 is connected to port eth0
* The Raspberry Pi is connected to a power converter providing it with the necessary voltage


### Wiring of LOGO!8
* Relais 1 of the LOGO!8 is connected to the gate, allowing cars to access the building
* Relais 2 of the LOGO!8 is connected to the pedestrian door, allowing the driver to access the building
* Depending on the version of LOGO!8, it can be wired to either 220VAC or there should be a power converter to provide the necessary voltage

## Installation with 3G/4G/LTE

![Alt Hardware installation schematic drawing](./assets/images/gateway-hardware-installation-3g.svg?sanitize=true)

The hardware to open the gate consists of two components:
* Siemens LOGO!8
* Raspberry Pi device

### Wiring of Raspberry Pi
* The Siemens Logo!8 is connected to port eth0 of the Raspberry Pi
* The Raspberry Pi has a special SIM card hat, where a SIM card has to be placed. Additionally an antenna has to be connected to this hat.
* The Raspberry Pi is connected to a power converter providing it with the necessary voltage

### Wiring of LOGO!8
* Relais 1 of the LOGO!8 is connected to the gate, allowing cars to access the building
* Relais 2 of the LOGO!8 is connected to the pedestrian door, allowing the driver to access the building
* Depending on the version of LOGO!8, it can be wired to either 220VAC or there should be a power converter to provide the necessary voltage

