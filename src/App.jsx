import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import Main from './routes/Main';
import NotFound from './routes/NotFound';

import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

export default function App() {
  return (
    <BrowserRouter>
      <Container fluid>
        <Row className="min-vh-100">
          <Col md={6} lg={5} xl={4} className="p-3 bg-light border-end">
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
    </BrowserRouter>
  );
}
