import React from 'react';
import PropTypes from 'prop-types';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

// The classic zip function for two arrays.
const zip = (a, b) => a.map((x, i) => [x, b[i]]);

export default function Main({
  nuA, fM, numberOfMeasurements, configuration, maxStroke, minSeparation, solution,
}) {
  // This is an iterator over the number of measurements. It is used to compute
  // drawing values for each measurement.
  const measurements = [...Array(numberOfMeasurements).keys()];

  // Generic lengths.
  const padding = 50;

  // Lengths in the X direction.
  const leadFibreW = 100;
  const couplerW = 80;
  const connectingFibreW = 100 * (numberOfMeasurements + 1);
  const collimatorW = 80;
  const standoffUnitW = 200;
  const reflectorW = 50;
  const motionW = 0.8 * standoffUnitW;
  // Lengths in the Y direction.
  const couplerH = 20;
  const collimatorH = 30;
  const reflectorH = 50;
  const collimatorReflectorYGap = 150;

  // Compute viewbox dimensions.
  const viewW = (
    + 2 * padding // Padding on left and right.
    + leadFibreW
    + connectingFibreW
    + standoffUnitW * numberOfMeasurements
    // The right half of the reflector or motion line is used (whichever is larger).
    + 0.5 * Math.max(reflectorW, motionW)
  );
  const viewH = (
    + 2 * padding // Padding on the top and bottom.
    // The top and bottom collimators/reflectors each contribute half of their
    // heights.
    + Math.max(couplerH, collimatorH, reflectorH)
    // The rest is made up by the number of gaps.
    + (numberOfMeasurements - 1) * collimatorReflectorYGap
  );

  // X positions to the centre of each element.
  const couplerX = padding + leadFibreW;
  const collimatorX = couplerX + connectingFibreW;
  const reflectorXs = measurements.map((m) => collimatorX + (m + 1) * standoffUnitW);

  // Y positions to the centre of each element.
  const couplerY = 0.5 * viewH;
  const collimatorYs = measurements.map((m) => {
    const gaps = numberOfMeasurements - 1;
    const span = gaps * collimatorReflectorYGap;
    return 0.5 * viewH + (gaps == 0 ? 0 : (m / gaps - 0.5) * span);
  });
  const reflectorYs = collimatorYs;

  // Auxiliary lengths.
  const collimatorL = 0.6 * collimatorW; // Length of collimator body.
  const reflectorJ = -0.2 * reflectorH; // Where the line through the reflector connects on the left.

  const outlineStyle = { fill: 'none', stroke: '#000000', strokeLinecap: 'round', strokeLinejoin: 'round', strokeOpacity: 1, strokeWidth: '2px' }
  return (
    <Container>
      <Row>
        <Col>
          <div className="border">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${viewW} ${viewH}`}>
              {/* TODO: Draw lead fibre */}
              {/* Coupler */}
              <path
                style={outlineStyle}
                d={`
                  M${couplerX} ${couplerY}
                  m${-couplerW/2} ${couplerH/2}
                  l${0} ${-couplerH}
                  l${couplerW} ${0}
                  l${0} ${couplerH}
                  l${-couplerW} ${0}
                  z
                  `}
                />
              {/* Collimators */}
              {collimatorYs.map((collimatorY, index) => {
                return (
                  <path
                    key={index}
                    style={outlineStyle}
                    d={`
                      M${collimatorX} ${collimatorY}
                      m${-collimatorW/2} ${0}
                      l${collimatorW-collimatorL} ${-collimatorH/2}
                      l${collimatorL} ${0}
                      l${0} ${collimatorH}
                      l${-collimatorL} ${0}
                      z
                      `}
                  />
                );
              })}
              {/* TODO: Draw retroreflectors */}
              {zip(reflectorXs, reflectorYs).map(([reflectorX, reflectorY], index) => {
                return (
                  <path
                    key={index}
                    style={outlineStyle}
                    d={`
                      M${reflectorX} ${reflectorY}
                      m${reflectorW/2} ${0}
                      l${-reflectorW} ${-reflectorH/2}
                      l${0} ${reflectorH}
                      z
                      l${-reflectorW} ${reflectorJ}
                      `}
                    />
                );
              })}
              {/*
              <path
                style={outlineStyle}
                d={`
                  M${800} ${250}
                  m${reflectorW/2} ${0}
                  l${-reflectorW} ${-reflectorH/2}
                  l${0} ${reflectorH}
                  z
                  l${-reflectorW} ${reflectorJ}
                  `}
                />
              */}
              {/* TODO: Draw fibres */}
              {/* TODO: Draw axis labels */}
              {/* TODO: Draw delay lengths */}
              {/* TODO: Draw motion */}
              {/* TODO: Draw either normalized or actual lengths */}
              {/*
              <circle style={{ fillOpacity: 1, fill:'#c757e7', stroke: 'none' }} r="50" cx="50" cy="50"/>
              <path style={{ fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', strokeOpacity: 1, strokeWidth: '8px', stroke: '#ffffff' }} d="M15 50c7-35 28-35 35 0s28 35 35 0"/>
              */}
            </svg>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          {/* TODO: Remove this */}
          <div className="pt-5 text-muted d-none">
            <p>&nu;<sub>A</sub> = {nuA} Hz</p>
            <p>f<sub>m</sub> = {fM} Hz</p>
            <p>Number of measurements = {numberOfMeasurements}</p>
            <p>Configuration = {configuration}</p>
            <p>Max mechanical stroke = {maxStroke} m</p>
            <p>Mechanical separation between axes = {minSeparation} m</p>
            <p>Solution = {solution}</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

Main.propTypes = {
  nuA: PropTypes.number.isRequired,
  fM: PropTypes.number.isRequired,
  numberOfMeasurements: PropTypes.number.isRequired,
  configuration: PropTypes.number.isRequired,
  maxStroke: PropTypes.number.isRequired,
  minSeparation: PropTypes.number.isRequired,
  solution: PropTypes.object.isRequired,
};
