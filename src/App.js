import "./App.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import GaugeChart from "react-gauge-chart";

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
}

function parseJSON(response) {
  return response.json();
}

function fomratHHMMSS(secs) {
  var sec_num = parseInt(secs, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
}

function App() {
  const [data, setData] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(1000);

  const fetchMetrics = () => {
    fetch(`/api/status`, {
      accept: "application/json",
    })
      .then(checkStatus)
      .then(parseJSON)
      .then(setData);
  };

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const temperature = Math.round(data.temperature * 2) / 2;
  const humidity = Math.round(data.humidity * 100*2) /2;

  const generateContent = () => {
    return data.mode === "timer" ? (
      <Col sd>
        <Button
          onClick={() => {
            fetch(`/api/stop`, {
              accept: "application/json",
            })
              .then(checkStatus)
              .then(parseJSON)
              .then(setData);
          }}
        >
          Stop
        </Button>
      </Col>
    ) : (
      <>
        <Col sd>
          <Button
            onClick={() => {
              fetch(
                "/api/start?" +
                  new URLSearchParams({
                    mode: "auto",
                    temp: 80,
                  }),
                {
                  accept: "application/json",
                }
              )
                .then(checkStatus)
                .then(parseJSON)
                .then(setData);
            }}
          >
            Auto Cycle
          </Button>
        </Col>
        <Col sd>
          <Button
            onClick={() => {
              fetch(
                "/api/start?" +
                  new URLSearchParams({
                    mode: "timer",
                    time: 60,
                  }),
                {
                  accept: "application/json",
                }
              )
                .then(checkStatus)
                .then(parseJSON)
                .then(setData);
            }}
          >
            Timer Cycle
          </Button>
        </Col>
      </>
    );
  };

  return (
    <div className="App">
      <Container>
        <Row className="justify-content-md-center">
          <Col>
            <span>Time Remaining : {fomratHHMMSS(data.time_remaining)} s</span>
          </Col>
        </Row>
        <Row className="justify-content-md-center">{generateContent()}</Row>
        <Row>
          <Col>
            <GaugeChart
              nrOfLevels={420}
              arcsLength={[0.3, 0.5, 0.2]}
              colors={["#5BE12C", "#F5CD19", "#EA4228"]}
              textColor={"#000"}
              percent={humidity / 100}
              arcPadding={0.02}
              style={{ height: 250 }}
            />
          </Col>
        </Row>
      </Container>

      <Container>
        {Object.entries(data).map(([key, value]) => (
          <Row className="justify-content-md-center">
            <Col>
              {key} : {value?.toString()}{" "}
            </Col>
          </Row>
        ))}
      </Container>
    </div>
  );
}

export default App;
