const snap7 = require('node-snap7')
const Log = require('./log')

const GateClient = (ip) => {
    const s7client = new snap7.S7Client()

    const connect = () => {
        Log.info('Connecting to the s7 client ip=%s', ip)
        return new Promise((resolve, reject) => {
            s7client.ConnectTo(ip, 0, 1, (err) => {
                if (err) {
                    Log.error(' >> Connection failed. Code #' + err + ' - ' + s7client.ErrorText(err))
                    return reject()
                }
                Log.info('Successfully connected to the s7 client')
                resolve()
            })
        })
    }

    const write = (buffer) => {
        const start = 0
        const size = 1
        const dbNumber = parseInt(process.env.PLC_DATABASE, 10)
        Log.info('Start writing ' + buffer.toString('hex') + ' to the database ' + dbNumber + ' at ' + start + ' with the size of ' + size)
        return new Promise((resolve, reject) => {
            s7client.DBWrite(dbNumber, start, size, buffer, (err) => {
                if (err) {
                    Log.error(' >> Writing failed. Code #' + err + ' - ' + s7client.ErrorText(err))
                    return reject()
                }
                Log.info('Successfully written to the database of the s7 client')
                resolve()
            })
        })
    }

    const delay = (amount) => {
        Log.info('Delay process for ' + amount + 'ms')
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), amount)
        })
    }

    const open = async () => {
        Log.info('Opening the gate')
        const valToOpenGate = Buffer.alloc(1, 1) // is equally to '01'
        const valToResetGate = Buffer.alloc(1, 0) // is equally to '00'

        await write(valToOpenGate)
        await delay(process.env.PLC_DELAY_TO_RESET)
        Log.info('Resets the state of the gate')
        await write(valToResetGate)
        Log.info('Finished opening gate')
    }

    const disconnect = () => {
        Log.info('Disconnecting form the s7 client')
        s7client.Disconnect()
    }

    return { connect, open, disconnect }

}

module.exports = GateClient
