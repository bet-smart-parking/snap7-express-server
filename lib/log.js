const pino = require('pino')
const Log = pino({
    prettyPrint: {
        levelFirst: true
    },
    prettifier: require('pino-pretty')
})

module.exports = Log