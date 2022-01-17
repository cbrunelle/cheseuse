const express = require("express");
const AbortController = require("node-abort-controller");
const isPi = require("detect-rpi");

const dryer = isPi() ? require("./hal") : require("./simulation");

const app = express();

const COOLDOWN_TIME = 15;
const data = {
  mode: null,
  time_remaining: 0,
};

let start_timestamp;
let abortController = new AbortController();
let heat_on = false;
let auto_check_temp = false;
let auto_check_resolve;

function wait(ms, opts = {}) {
  return new Promise((resolve, reject) => {
    let timerId = setTimeout(resolve, ms);
    if (opts.signal) {
      // implement aborting logic for our async operation
      opts.signal.addEventListener("abort", (event) => {
        clearTimeout(timerId);
        reject(event);
      });
    }
  });
}

let refresh = () => {
  if (data.mode === "timer") {
    data.time_remaining = start_timestamp
      ? Math.round(Date.now() / 1000) - start_timestamp
      : 0;
    data.time_remaining = data.time * 60 - data.time_remaining;
  } else {
    data.time_remaining = 0;
  }

  data.heat_on = dryer.getHeater();
  data.power_on = dryer.getPower();
};
 
function reset() {
  data.mode = null;
  start_timestamp = 0;
  dryer.setHeater(false);
  dryer.setPower(false);
  heat_on = false;
  auto_check_temp = false;
}

function stop() {
  abortController.abort();
  abortController = new AbortController();
  reset();
}

function start() {
  return wait(5000, { signal: abortController.signal })
    .then(() => {
      dryer.setPower(true);
      return wait(1000, { signal: abortController.signal });
    })
    .then(() => {
      dryer.pulseStart();
      return wait(1000, { signal: abortController.signal });
    });
}

function timer(time) {
  data.mode = "timer";
  start_timestamp = Math.round(Date.now() / 1000);

  start()
    .then(() => {
      heat_on = true;
      return wait((time - 1 - 1 - COOLDOWN_TIME) * 60 * 1000, {
        signal: abortController.signal,
      });
    })
    .then(() => {
      heat_on = false;
      dryer.setHeater(false);
      return wait(COOLDOWN_TIME * 60 * 1000, { signal: abortController.signal });
    })
    .then(() => {
      reset();
    })
    .catch(() => {
      reset();
    });
}

function auto() {
  data.mode = "auto";
  start_timestamp = Math.round(Date.now() / 1000);

  start()
    .then(() => {
      heat_on = true;
      // Wait for humidity to reach sensor properly
      return wait(60 * 1000, { signal: abortController.signal });
    })
    .then(() => new Promise((resolve, reject) => {
      auto_check_temp = true;
      auto_check_resolve = resolve;

      // Wait for max 2 hours
      wait(2 * 60 * 60 * 1000, { signal: abortController.signal }).then(() => {reject()});
    }))
    .then(() => {
      heat_on = false;
      dryer.setHeater(false);
      data.time = COOLDOWN_TIME;
      return wait(COOLDOWN_TIME * 60 * 1000, { signal: abortController.signal });
    })
    .then(() => {
      reset();
    })
    .catch(() => {
      reset();
    });
}

let temperature_moving_average = [];
let humidity_moving_average = [];

setInterval(() => {
  dryer.read((err, temperature, humidity) => {
    if (!err) {

      temperature_moving_average = temperature_moving_average.concat([temperature]).slice(-10);
      data.temperature = temperature_moving_average.reduce((a, b) => a + b, 0)/ temperature_moving_average.length;

      humidity_moving_average = humidity_moving_average.concat([humidity]).slice(-10);
      data.humidity = humidity_moving_average.reduce((a, b) => a + b, 0)/ humidity_moving_average.length;

      if (heat_on) {
        dryer.setHeater(data.temperature < data.temp_control);
      }

      if (data.mode === 'auto' && auto_check_temp && data.humidity < 0.3) {
        auto_check_resolve();
        auto_check_temp = false;
      }
    }
  });
}, 2000);

app.set("port", process.env.PORT || 3001);

app.get("/api/status", (req, res) => {
  refresh();
  res.json(data);
});

app.get("/api/start", (req, res) => {
  stop();

  data.mode = req.query.mode || "timer";
  data.time = req.query.time || 70;
  data.temp_control = req.query.temp || 80;

  if (data.mode === "timer") {
    timer(data.time);
  } else if (data.mode === "auto") {
    auto();
  }

  res.json(data);
});

app.get("/api/stop", (req, res) => {
  stop();
  res.json(data);
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`);
});
