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
const homeyId1 = '5c46ead55c9fd81c1f3324a7'
const homeyId2 = '5a7afd1f4445b17034a1e5c5'

const usbPort = '/dev/ttyUSB0'
const bps = 115200
const bits = 8
const parity = 'none'

const homeyEndpoint = '/update'
const homeyHost1 = 'https://' + homeyId1 + '.connect.athom.com/api/app/com.p1'
const homeyHost2 = 'https://' + homeyId2 + '.connect.athom.com/api/app/com.p1'

function publishToHomey (output) {
    const data = {
        'meterType': output.meterModel,
        'version': output.dsmrVersion,
        'timestamp': output.dsmrVersion,
    }

    if (output.power) {
        data.electricity = {
            'received': {
                'tariff1': {
                    'reading': output.power.totalConsumed1,
                    'unit': 'kWh',
                },
                'tariff2': {
                    'reading': output.power.totalConsumed2,
                    'unit': 'kWh',
                },
                'actual': {
                    'reading': output.power.totalConsumed,
                    'unit': 'kW',
                },
            },
            'delivered': {
                'tariff1': {
                    'reading': output.power.totalProduced1,
                    'unit': 'kWh',
                },
                'tariff2': {
                    'reading': output.power.totalProduced2,
                    'unit': 'kWh',
                },
                'actual': {
                    'reading': output.power.actualProduced,
                    'unit': 'kW',
                },
            },
            'tariffIndicator': output.power.activeTariff,
            'switchPosition': output.power.switchPosition,
            'voltageSags': {
                'L1': output.power.voltageSagsL1,
                'L2': output.power.voltageSagsL2,
                'L3': output.power.voltageSagsL3,
            },
            'voltageSwell': {
                'L1': output.power.voltageSwellsL1,
                'L2': output.power.voltageSwellsL2,
                'L3': output.power.voltageSwellsL3,
            },
            'instantaneous': {
                'current': {
                    'L1': {
                        'reading': output.power.instantaneousCurrentL1,
                        'unit': 'A',
                    },
                    'L2': {
                        'reading': output.power.instantaneousCurrentL2,
                        'unit': 'A',
                    },
                    'L3': {
                        'reading': output.power.instantaneousCurrentL3,
                        'unit': 'A',
                    },
                },
                'power': {
                    'positive': {
                        'L1': {
                            'reading': output.power.instantaneousProducedElectricityL1,
                            'unit': 'kW',
                        },
                        'L2': {
                            'reading': output.power.instantaneousProducedElectricityL2,
                            'unit': 'kW',
                        },
                        'L3': {
                            'reading': output.power.instantaneousProducedElectricityL3,
                            'unit': 'kW',
                        },
                    },
                    'negative': {
                        'L1': {
                            'reading': output.power.instantaneousConsumedElectricityL1,
                            'unit': 'kW',
                        },
                        'L2': {
                            'reading': output.power.instantaneousConsumedElectricityL2,
                            'unit': 'kW',
                        },
                        'L3': {
                            'reading': output.power.instantaneousConsumedElectricityL3,
                            'unit': 'kW',
                        },
                    },
                },
            },
        }
    }

    if (output.gas) {
        data.gas = {
            'deviceType': '003',
            'equipmentId': output.gas.equipmentId,
            'timestamp': output.gas.timestamp,
            'reading': output.gas.totalConsumed,
            'unit': 'm3',
            'valvePosition': output.gas.valvePosition,
        }
    }

    fetch(homeyHost1 + homeyEndpoint, {
        method: 'post',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'},
    }).then(() => {
        // posted to homey!
    }).catch((error) => {
        logger.error(error)
    })

    fetch(homeyHost2 + homeyEndpoint, {
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