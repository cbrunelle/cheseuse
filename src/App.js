
import './App.css';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';

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

function App() {
  
  const [data, setData] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(1000);

  const fetchMetrics = () => {
    fetch(`/api/status`, {
      accept: 'application/json',
    }).then(checkStatus)
      .then(parseJSON).then(setData);
  }

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return (
    <div className="App">
      <Container>
        <Row className="justify-content-md-center">
          <Col>
          <span>Power : {data.power ? "on": "off"}</span>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col>
          <span>Temperature : {data.temperature} °C</span>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col>
          <span>Humidity : {data.humidity * 100} %</span>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col>
          <span>Time Remaining : {data.time_remaining} s</span>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md>
            <Button >Auto Cycle</Button>
          </Col>
          <Col md>
            <Button>Timer Cycle</Button>
          </Col>
          <Col md>
            <Button>Stop</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
