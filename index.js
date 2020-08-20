require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const Log = require('./lib/log')
const GateClient = require('./lib/gate-client')

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./assets/openapi.json')
const swaggerServers = process.env.SERVERS.split(',').map((value)=>({'url':value}))
var swaggerDocumentWithServers = swaggerDocument
swaggerDocumentWithServers.servers = swaggerServers

const App = express()
const port = process.env.PORT

App.use(helmet())

App.put('/opengate/', async (req, res) => {
    const startedAt = process.hrtime()
    Log.info() // Line break
    Log.info('ENTER: ' + req.method + ' ' + req.url)

    try {
        const gateId = req.query.gateId;
        const gateClient = GateClient(process.env.PLC_IP)
        await gateClient.connect()
        await gateClient.open(gateId)
        gateClient.disconnect()
    } catch (e) {
        return res.status(500).send('Could not connect to the gate system.')
    }

    res.status(200).send('OK')
    const endedAt = process.hrtime(startedAt)
    Log.info('EXIT: ' + req.method + ' ' + req.url + ' ' + res.statusCode + ' %ds %dms', endedAt[0], endedAt[1] / 1000000)
})

App.use('/docs/', swaggerUi.serve, swaggerUi.setup(swaggerDocumentWithServers))

App.listen(port, () => {
    Log.info(`Server app listening on port ${port}!`)
})