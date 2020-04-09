require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const Log = require('./lib/log')
const GateClient = require('./lib/gate-client')

const App = express()
const port = process.env.PORT

App.use(helmet())

App.use((req, res, next) => {
    const startedAt = process.hrtime()

    next();

})

App.get('/', async (req, res) => {
    const startedAt = process.hrtime()
    Log.info() // Line break
    Log.info('ENTER: ' + req.method + ' ' + req.url)

    const gateClient = GateClient(process.env.PLC_IP)
    await gateClient.connect()
    await gateClient.open()
    gateClient.disconnect()

    res.status(200).send('OK')
    const endedAt = process.hrtime(startedAt)
    Log.info('EXIT: ' + req.method + ' ' + req.url + ' ' + res.statusCode + ' %ds %dms', endedAt[0], endedAt[1] / 1000000)
})

App.listen(port, () => {
    Log.info(`Server app listening on port ${port}!`)
})