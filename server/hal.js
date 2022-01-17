const sensorLib = require("node-dht-sensor");
var Gpio = require("onoff").Gpio;

const power = new Gpio(15, "out");
const start_relay = new Gpio(16, "out");
const heater = new Gpio(17, "out");

heater.writeSync(0);
power.writeSync(0);

let heater_on = false;
let power_on = false;

module.exports = {
  read: function (callback) {
    sensorLib.read(22, 14, function (err, temperature, humidity) {
      callback(err, temperature, humidity / 100);
    });
  },
  setHeater: function (onoff) {
    heater_on = !!onoff;
    heater.writeSync(heater_on ? 1 : 0);
  },
  getHeater: function (onoff) {
    return heater_on;
  },
  setPower: function (onoff) {
    power_on = !!onoff;
    power.writeSync(power_on ? 1 : 0);
  },
  getPower: function () {
    return power_on;
  },
  pulseStart: function () {
    start_relay.writeSync(1);
    setTimeout(() => {
      start_relay.writeSync(0);
    }, 2000);
  },
};
