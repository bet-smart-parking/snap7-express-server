require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const basicAuth = require('express-basic-auth')
const rateLimit = require("express-rate-limit")
const Log = require('./lib/log')
const GateClient = require('./lib/gate-client')

const App = express()
const port = process.env.PORT

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many accounts created from this IP, please try again after an hour"
});

App.use(limiter);
App.use(helmet())
App.use(basicAuth({
    users: {
        [process.env.AUTH_USER]: process.env.AUTH_PASSWORD
    }
}))

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