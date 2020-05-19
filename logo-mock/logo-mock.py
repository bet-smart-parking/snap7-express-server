#!/usr/bin/python
# -*- coding:utf-8 -*-
import time
import snap7
from snap7 import util
import logging
import configparser

logging.basicConfig(level=logging.INFO)

server = snap7.server.Server()
server.create()
size = 1
data = (snap7.types.wordlen_to_ctypes[snap7.types.S7WLByte] * size)()
data[0] = 5
server.register_area(snap7.types.srvAreaDB, 1, data)
server.start()

config = configparser.ConfigParser()
config.read('logo-mock.ini')
logging.info("Slackbot URL: " + config['SLACK']['SlackBotUrl'])

try:
    while (True):
        while (True):
            event = server.pick_event()
            if event:
                logging.info(server.event_text(event))
            else:
                break
        time.sleep(1)


except KeyboardInterrupt:
    logging.info("ctrl + c:")
    server.stop()
    server.destroy()
    exit()
