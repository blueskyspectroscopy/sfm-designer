import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import Configuration, { computeNumberOfReflections } from './model/Configuration';
import Footer from './components/Footer';
import Main from './routes/Main';
import NotFound from './routes/NotFound';
import Sidebar from './components/Sidebar';

export default function App() {
  const [nuA, setNuA] = useState(1e9); // Hz.
  const [fM, setFM] = useState(1e5); // Hz.
  const [numberOfMeasurements, setNumberOfMeasurements] = useState(2);
  const [configuration, setConfiguration] = useState(Configuration.SHARED_REFERENCE);
  const [maxStroke, setMaxStroke] = useState(0.15); // m.
  const [minSeparation, setMinSeparation] = useState(0.5); // m.
  const [solution, setSolution] = useState(0);
  const [numberOfReflections, setNumberOfReflections] = useState(computeNumberOfReflections({
    configuration, numberOfMeasurements
  }));
  return (
    <BrowserRouter>
      <Container fluid>
        <Row className="min-vh-100">
          <Col md={6} lg={5} xl={4} className="p-3 bg-light border-end d-print-none user-select-none">
            <Sidebar
              nuA={nuA} setNuA={setNuA}
              fM={fM} setFM={setFM}
              numberOfMeasurements={numberOfMeasurements} setNumberOfMeasurements={setNumberOfMeasurements}
              numberOfReflections={numberOfReflections} setNumberOfReflections={setNumberOfReflections}
              configuration={configuration} setConfiguration={setConfiguration}
              maxStroke={maxStroke} setMaxStroke={setMaxStroke}
              minSeparation={minSeparation} setMinSeparation={setMinSeparation}
              solution={solution} setSolution={setSolution}
              />
          </Col>
          <Col className="p-3">
            <Routes>
              <Route path="/" element={<Main
                nuA={nuA}
                fM={fM}
                numberOfMeasurements={numberOfMeasurements}
                numberOfReflections={numberOfReflections}
                configuration={configuration}
                maxStroke={maxStroke}
                minSeparation={minSeparation}
                solution={solution}
              />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </Col>
        </Row>
      </Container>
    </BrowserRouter>
  );
}
