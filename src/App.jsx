import React, { createContext, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import Configuration, { computeNumReflections } from './model/Configuration';
import Footer from './components/Footer';
import Main from './routes/Main';
import NotFound from './routes/NotFound';
import Sidebar from './components/Sidebar';

// This context is used to pass all of the model data to components.
export const DataContext = createContext(null);

export default function App() {
  const [nuA, setNuA] = useState(1e9); // Hz.
  const [fM, setFM] = useState(1e5); // Hz.
  const [numMeasurements, setNumMeasurements] = useState(2);
  const [configuration, setConfiguration] = useState(Configuration.SHARED_REFERENCE);
  const [minSeparation, setMinSeparation] = useState(0.5); // m.
  const [solution, setSolution] = useState(0);
  const [numReflections, setNumReflections] = useState(computeNumReflections({
    configuration, numMeasurements
  }));
  const dataContextValue = {
    nuA, setNuA,
    fM, setFM,
    numMeasurements, setNumMeasurements,
    configuration, setConfiguration,
    minSeparation, setMinSeparation,
    solution, setSolution,
    numReflections, setNumReflections,
  };
  return (
    <BrowserRouter>
      <DataContext.Provider value={dataContextValue}>
        <Container fluid>
          <Row className="min-vh-100">
            <Col md={6} lg={5} xl={4} className="p-3 bg-light border-end d-print-none user-select-none">
              <Sidebar />
            </Col>
            <Col className="p-3">
              <Routes>
                <Route path="/" element={<Main />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </Col>
          </Row>
        </Container>
      </DataContext.Provider>
    </BrowserRouter>
  );
}
