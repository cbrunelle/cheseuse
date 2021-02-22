

const express = require("express");
const isPi = require('detect-rpi');


const sensorLib = (isPi()) ? require("./hal") : require('./simulation');

let running_timer;
let cancel = false;

const app = express();
const data = {
  mode: 'timer',
  start_relay: false,

  power: true,
  temperature: 22.5, 
  humidity: .5,
  time_remaining: 0
};

function timer(time = 75) {
  cancel = false;
  running_timer = setTimeout(() => {
    sensorLib.setPower(true);
    if (cancel) return;

    running_timer = setTimeout(() => {

      sensorLib.pulseStart();
      if (cancel) return;

      running_timer = setTimeout( () => {
        sensorLib.setHeater(true);
        if (cancel) return;

        running_timer = setTimeout( () => {

          sensorLib.setHeater(false);
          if (cancel) return;

          running_timer = setTimeout( () => {

            sensorLib.setPower(false);
            if (cancel) return;
  
          }, 15*60*1000)
        }, 75*60*1000)
      }, 1000)
    }, 1000);
  }, 5000);
}

app.set("port", process.env.PORT || 3001);

app.get("/api/status", (req, res) => {
  res.json(data);
});

app.get("/api/start", (req, res) => {
  timer();

  res.json(data);
});

app.get("/api/stop", (req, res) => {
  cancel = true;
  clearTimeout(running_timer);
  res.json(data);
});

setInterval(function() {
  sensorLib.read(22, 14, function(err, temperature, humidity) {
    if (!err) {
      data.humidity = humidity;
      data.temperature = temperature;
    }
  });
}, 2000);

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});