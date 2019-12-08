const dsmr = require('node-dsmr')
const fetch = require('node-fetch')
const logger = require('winston')

logger.add(new logger.transports.Console({
    level: 'info',
}))

/**
 * 1: Goto: http://developer.athom.com
 * 2: Login into Homey
 * 3: Open the inspector (chrome f12)
 * 4: Click the `network` tab
 * 5: Refresh the page (you see couple of webpages being called)
 * 6: Copy the `homeyId` from the url: https://[localId].homey.homeylocal.com/api/manager/system/ping?id=[homeyId]
 */
const homeyId = '[homeyId]'

const usbPort = '/dev/ttyUSB0'
const bps = 115200
const bits = 8
const parity = 'none'

const homeyEndpoint = '/update'
const homeyHost = 'https://' + homeyId + '.connect.athom.com/api/app/com.p1'

function publishToHomey (line) {
    const data = {
        'electricity': {
            'received': {
                'tariff2': {
                    'reading': line['power'] &&
                    line['power']['instantaneousProducedElectricityL2']
                      ? line['power']['instantaneousProducedElectricityL2']
                      : null,
                    'unit': 'kWh',
                },
                'actual': {
                    'reading': line['power'] &&
                    line['power']['instantaneousProducedElectricityL3']
                      ? line['power']['instantaneousProducedElectricityL3']
                      : null,
                    'unit': 'kW',
                },
                'tariff1': {
                    'reading': line['power'] &&
                    line['power']['instantaneousProducedElectricityL1']
                      ? line['power']['instantaneousProducedElectricityL1']
                      : null,
                    'unit': 'kWh',
                },
            },
            'delivered': {
                'tariff2': {
                    'reading': line['power'] &&
                    line['power']['instantaneousConsumedElectricityL2']
                      ? line['power']['instantaneousConsumedElectricityL2']
                      : null,
                    'unit': 'kWh',
                },
                'actual': {
                    'reading': line['power'] &&
                    ['power']['instantaneousConsumedElectricityL3']
                      ? line['power']['instantaneousConsumedElectricityL3']
                      : null,
                    'unit': 'kW',
                },
                'tariff1': {
                    'reading': line['power'] &&
                    line['power']['instantaneousConsumedElectricityL1']
                      ? line['power']['instantaneousConsumedElectricityL1']
                      : null,
                    'unit': 'kWh',
                },
            },
        },
        'gas': {
            'reading': line['gas'] && line['gas']['totalConsumed']
              ? line['gas']['totalConsumed']
              : null,
            'unit': 'm3',
        },
    }

    fetch(homeyHost + homeyEndpoint, {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'},
    }).then(() => {
        // posted to homey!
    }).catch((error) => {
        logger.error(error)
    })
}

const p1Meter = new dsmr({
    port: usbPort,
    baudrate: bps,
    bits: bits,
    parity: parity,
})

p1Meter.on('connected', () => {
    logger.info('p1 smartmeter is connected!')
})

p1Meter.on('update', line => {
    if (line.hasOwnProperty('gas')) {
        logger.info('p1 smartmeter update gas')
        publishToHomey(line)
    }
    if (line.hasOwnProperty('power')) {
        logger.info('p1 smartmeter update power')
        publishToHomey(line)
    }
})

p1Meter.on('disconnected', () => {
    logger.info('p1 smartmeter is disconnected')
})

p1Meter.connect()