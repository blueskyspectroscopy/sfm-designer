import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import Configuration from './model/Configuration';
import Footer from './components/Footer';
import Main from './routes/Main';
import NotFound from './routes/NotFound';
import Sidebar from './components/Sidebar';

export default function App() {
  const [nuA, setNuA] = useState(1e9); // Hz.
  const [fM, setFM] = useState(1e5); // Hz.
  const [numberOfMeasurements, setNumberOfMeasurements] = useState(2);
  const [configuration, setConfiguration] = useState(Configuration.SHARED_REFERENCE);
  return (
    <BrowserRouter>
      <Container fluid className="user-select-none">
        <Row className="min-vh-100">
          <Col md={6} lg={5} xl={4} className="p-3 bg-light border-end">
            <Sidebar
              nuA={nuA} setNuA={setNuA}
              fM={fM} setFM={setFM}
              numberOfMeasurements={numberOfMeasurements} setNumberOfMeasurements={setNumberOfMeasurements}
              configuration={configuration} setConfiguration={setConfiguration}
              />
          </Col>
          <Col className="p-3">
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* TODO Remove this div. */}
            <div className="d-none">
              <p>&nu;<sub>A</sub> = {nuA} Hz</p>
              <p>f<sub>m</sub> = {fM} Hz</p>
              <p>Number of measurements = {numberOfMeasurements}</p>
              <p>Configuration = {configuration}</p>
            </div>
            <Footer />
          </Col>
        </Row>
      </Container>
    </BrowserRouter>
  );
}
