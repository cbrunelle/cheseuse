
const sensorLib = require("node-dht-sensor");
const express = require("express");

const app = express();

app.set("port", process.env.PORT || 3001);
app.get("/api/status", (req, res) => {
  res.json({
    power: true,
    temperature: 22.5, 
    humidity: .5,
    time_remaining: 13.1
  })
});


sensorLib.initialize({
  test: {
    fake: {
      temperature: 21,
      humidity: 60
    }
  }
});

setInterval(function() {
  sensorLib.read(22, 14, function(err, temperature, humidity) {
    if (!err) {
      console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);
    }
  });
}, 2000);

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});