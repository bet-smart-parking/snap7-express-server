require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const Log = require('./lib/log')
const GateClient = require('./lib/gate-client')

const App = express()
const port = process.env.PORT

App.use(helmet())

App.get('/', async (req, res) => {
    const startedAt = process.hrtime()
    Log.info() // Line break
    Log.info('ENTER: ' + req.method + ' ' + req.url)

    try {
        const gateClient = GateClient(process.env.PLC_IP)
        await gateClient.connect()
        await gateClient.open()
        gateClient.disconnect()
    } catch (e) {
        return res.status(500).send('Could not connect to the gate system.')
    }

    res.status(200).send('OK')
    const endedAt = process.hrtime(startedAt)
    Log.info('EXIT: ' + req.method + ' ' + req.url + ' ' + res.statusCode + ' %ds %dms', endedAt[0], endedAt[1] / 1000000)
})

App.listen(port, () => {
    Log.info(`Server app listening on port ${port}!`)
})