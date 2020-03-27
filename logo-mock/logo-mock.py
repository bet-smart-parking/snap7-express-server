#!/usr/bin/python
# -*- coding:utf-8 -*-
import time
import snap7
from snap7 import util
import logging


logging.basicConfig(level=logging.DEBUG)

server = snap7.server.Server()
server.create()

size = 1
data = (snap7.types.wordlen_to_ctypes[snap7.types.S7WLByte] * size)()
data[0] = 5
server.register_area(snap7.types.srvAreaDB, 1, data)

server.start()




try:
    num = 0
    while (True):
        num = num + 1


except KeyboardInterrupt:
    logging.info("ctrl + c:")
    server.stop()
    server.destroy()
    exit()
