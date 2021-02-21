

const express = require("express");
var isPi = require('detect-rpi');

const app = express();
const data = {
  power: true,
  temperature: 22.5, 
  humidity: .5,
  time_remaining: 0
};

app.set("port", process.env.PORT || 3001);
app.get("/api/status", (req, res) => {
  res.json(data)
});

const sensorLib = (isPi()) ? require("node-dht-sensor") : {
  read: function(device, pin, callback) {
    callback(undefined, 23, 60);
  }
}

setInterval(function() {
  sensorLib.read(22, 14, function(err, temperature, humidity) {
    if (!err) {
      data.humidity = humidity / 100;
      data.temperature = temperature;
    }
  });
}, 2000);

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});