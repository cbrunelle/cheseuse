

const sensorLib = require("node-dht-sensor");
var Gpio = require('onoff').Gpio;

const power = new Gpio(15, 'out');
const start_relay = new Gpio(16, 'out');
const heater = new Gpio(17, 'out');

module.exports = {
    read: function(device, pin, callback) {
        sensorLib.read(22, 14, function(err, temperature, humidity) {
            callback(err, temperature,  humidity / 100);
        });
    },
    setHeater: function(onoff) {
        heater.writeSync(!!onoff? 1 : 0);
    },
    setPower: function(onoff) {
        power.writeSync(!!onoff? 1 : 0);
    }, 
    pulseStart: function() {
        start_relay.writeSync(1);
        setTimeout(() => { 
            start_relay.writeSync(0);
        }, 2000);
    },
  }