const Dsmr = require('node-dsmr');

const p1Meter = new Dsmr({
    port: '/dev/ttyUSB0',
    bps: 9600,
    bits: 7,
    parity: 'even'
});
p1Meter.connect();
p1Meter.on('update', line => {
    console.log(line);
});
