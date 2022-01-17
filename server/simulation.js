const ambiant_temperature = 23;
const ambiant_humidity = 30;

const heat_dissipation_per_second = -0.2;
const heat_gain_per_second = 1;

const humidity_dissipation_per_second_per_degree = -0.02;

let temperature = 23;
let humidity = 0.8;

let last_timestamp = 0;

let heater_on = false;
let power_on = false;

function refreshTimestamp() {
  const timestamp = Math.round(Date.now() / 1000);
  const delta = last_timestamp ? timestamp - last_timestamp : 0;
  last_timestamp = timestamp;
  return delta;
}

function update() {
  const delta = refreshTimestamp();
  const new_temperature = Math.min(
    80,
    Math.max(
      ambiant_temperature,
      temperature +
        delta * heat_gain_per_second * heater_on +
        delta * heat_dissipation_per_second
    )
  );
  humidity = Math.max(
    ambiant_humidity,
    humidity +
      (delta *
        humidity_dissipation_per_second_per_degree *
        (temperature + new_temperature)) /
        2
  );
  temperature = new_temperature;
}

module.exports = {
  read: function (callback) {
    update();
    callback(undefined, temperature, humidity / 100);
  },
  setHeater: function (onoff) {
    heater_on = !!onoff;
  },
  getHeater: function () {
    return heater_on;
  },
  setPower: function (onoff) {
    last_timestamp = 0;
    power_on = !!onoff;
  },
  getPower: function () {
    return power_on;
  },
  pulseStart: function () {
    humidity = 80;

    if (!power_on) {
      console.error("System not powered on.");
    }
  },
};
