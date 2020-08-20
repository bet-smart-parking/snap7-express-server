require('dotenv').config();
const Log = require('./lib/log')
const GateClient = require('./lib/gate-client');

(async function () {
    Log.info('START To open the gate')
    const gateClient = GateClient(process.env.PLC_IP)
    await gateClient.connect()
    await gateClient.open(1)
    gateClient.disconnect()
    Log.info('EXIT Finished opening gate request')
})()
