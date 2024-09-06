import React from 'react';
import PropTypes from 'prop-types';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import Configuration from '../model/Configuration';

// The classic zip functions for an arbitrary number of arrays.
function zip(...args) {
  const range = [...Array(Math.min(...args.map((x) => x.length))).keys()];
  return range.map((i) => args.map((a) => a[i]));
}

// The single character labels that can be used for each reflection.
const reflectionLabels = 'αβγδεζηθικλμνξοπρστυφχψω';

// TODO: Remove 1x1 coupler when only 1 axis is used.
export default function Main({
  nuA, fM, numberOfMeasurements, configuration, maxStroke, minSeparation, solution,
}) {
  // This is an iterator over the number of measurements. It is used to compute
  // drawing values for each measurement.
  const measurements = [...Array(numberOfMeasurements).keys()];

  // Generic lengths.
  const padding = 50;

  // Lengths in the X direction.
  const leadFibreW = 150;
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

  // Compute where to put the inline reflectors that form the references.
  const inlineReflectorXYs = (() => {
    switch (configuration) {
      case Configuration.SHARED_REFERENCE:
        return [[padding + 0.5 * (couplerX - 0.5 * couplerW - padding), couplerY]];
      case Configuration.UNIQUE_REFERENCES:
        return collimatorYs.map((collimatorY) => [collimatorX - 0.5 * collimatorW, collimatorY]);
      default:
        console.error(`Invalid configuration: ${configuration}. Not drawing inline reflectors.`);
        return [];
    }
  })();

  // Compute where to put the reflection labels.
  const reflectionLabelXYs = (() => {
    let unsorted = inlineReflectorXYs.concat(zip(reflectorXs, reflectorYs));
    switch (configuration) {
      case Configuration.SHARED_REFERENCE:
        return unsorted.sort(([x1, y1], [x2, y2]) => x1 - x2 != 0 ? x1 - x2 : y1 - y2);
      case Configuration.UNIQUE_REFERENCES:
        return unsorted.sort(([x1, y1], [x2, y2]) => y1 - y2 != 0 ? y1 - y2 : x1 - x2);
      default:
        console.error(`Invalid configuration: ${configuration}. Not drawing reflection labels.`);
        return [];
    }
  })();

  // Auxiliary lengths.
  const textShift = 5; // Pad text from other objects.
  const collimatorL = 0.6 * collimatorW; // Length of collimator body.
  const reflectorJ = -0.2 * reflectorH; // Where the line through the reflector connects on the left.
  const fibreBezierControlX = 50 * numberOfMeasurements; // Horizontal control point distance for fibre curves.
  const inlineReflectorR = 20; // Radius of inline reflections.
  const reflectionLabelYShift = -Math.max(inlineReflectorR, collimatorH); // Vertical shift for reflection labels to pull them off the optical axis basline.
  const motionArrowStep = 5; // Half width of the motion arrows.
  const fontSize = 16 + 3 * numberOfMeasurements; // Scales with measurements since the image increases in size.

  // SVG styles.
  const componentStyle = {
    fill: '#ffffff',
    fillOpacity: 1,
    stroke: '#000000',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeOpacity: 1,
    strokeWidth: '2px'
  };
  const inlineReflectorStyle = {
    ...componentStyle,
    fill: 'none',
    stroke: '#777777',
    strokeWidth: '4px',
  };
  const fibreStyle = {
    fill: 'none',
    stroke: '#0000ff',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeOpacity: 1,
    strokeWidth: '4px'
  }
  const beamStyle = {
    ...fibreStyle,
    strokeDasharray: '6 12',
  }
  const motionStyle = {
    fill: '#ff0000',
    stroke: '#ff0000',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeOpacity: 1,
    strokeWidth: '2px'
  }

  return (
    <Container>
      <Row>
        <Col>
          <div className="border">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${viewW} ${viewH}`}>
              {/* Lead fibre */}
              <path style={fibreStyle}
                d={`
                  M${padding} ${couplerY}
                  L${couplerX - 0.5 * couplerW} ${couplerY}
                  `}
              />
              {/* Fibres from coupler to collimators */}
              {collimatorYs.map((collimatorY, index) => {
                return (
                  <path key={index} style={fibreStyle}
                    d={`
                      M${couplerX + 0.5 * couplerW} ${couplerY}
                      C
                        ${couplerX + 0.5 * couplerW + fibreBezierControlX} ${couplerY}
                        ${collimatorX - 0.5 * collimatorW - fibreBezierControlX} ${collimatorY}
                        ${collimatorX - 0.5 * collimatorW} ${collimatorY}
                      `}
                  />
                );
              })}
              {/* Free-space beams */}
              {zip(collimatorYs, reflectorXs, reflectorYs).map(([collimatorY, reflectorX, reflectorY], index) => {
                return (
                  <path key={index} style={beamStyle}
                    d={`
                      M${collimatorX + 0.5 * collimatorW} ${collimatorY}
                      L${reflectorX - 0.5 * reflectorW} ${reflectorY}
                      `}
                  />
                );
              })}
              {/* Coupler */}
              <>
                <path style={componentStyle}
                  d={`
                    M${couplerX - 0.5 * couplerW} ${couplerY + 0.5 * couplerH}
                    l${0} ${-couplerH}
                    l${couplerW} ${0}
                    l${0} ${couplerH}
                    l${-couplerW} ${0}
                    z
                    `}
                  />
                <text
                  x={couplerX} y={couplerY - 0.5 * couplerH - textShift}
                  fontSize={fontSize} textAnchor="middle"
                  >
                  1&times;{numberOfMeasurements}
                </text>
              </>
              {/* Collimators */}
              {collimatorYs.map((collimatorY, index) => {
                return (
                  <path key={index} style={componentStyle}
                    d={`
                      M${collimatorX - 0.5 * collimatorW} ${collimatorY}
                      l${collimatorW - collimatorL} ${-0.5 * collimatorH}
                      l${collimatorL} ${0}
                      l${0} ${collimatorH}
                      l${-collimatorL} ${0}
                      z
                      `}
                  />
                );
              })}
              {/* Retroreflectors */}
              {zip(reflectorXs, reflectorYs).map(([reflectorX, reflectorY], index) => {
                return (
                  <path key={index} style={componentStyle}
                    d={`
                      M${reflectorX + 0.5 * reflectorW} ${reflectorY}
                      l${-reflectorW} ${-0.5 * reflectorH}
                      l${0} ${reflectorH}
                      z
                      l${-reflectorW} ${reflectorJ}
                      `}
                    />
                );
              })}
              {/* Inline reflectors. */}
              {inlineReflectorXYs.map(([inlineReflectorX, inlineReflectorY], index) => {
                return (
                  <path key={index} style={inlineReflectorStyle}
                    d={`
                      M${inlineReflectorX} ${inlineReflectorY + inlineReflectorR}
                      l${0} ${-2 * inlineReflectorR}
                      `}
                    />
                );
              })}
              {/* Reflection labels */}
              {reflectionLabelXYs.map(([reflectionLabelX, reflectionLabelY], index) => {
                return (
                  <text
                    key={index}
                    x={reflectionLabelX} y={reflectionLabelY + reflectionLabelYShift - textShift}
                    fontSize={fontSize} textAnchor="middle"
                    >
                    {reflectionLabels[index]}
                  </text>
                );
              })}
              {/* Motion lines. */}
              {zip(reflectorXs, reflectorYs).map(([reflectorX, reflectorY], index) => {
                return (
                  <React.Fragment key={index}>
                    <path style={motionStyle}
                      d={`
                        M${reflectorX - 0.5 * motionW} ${reflectorY + 0.5 * reflectorH + textShift}
                        l${motionW} ${0}
                        M${reflectorX - 0.5 * motionW} ${reflectorY + 0.5 * reflectorH + textShift}
                        l${2 * motionArrowStep} ${-motionArrowStep}
                        l${0} ${2 * motionArrowStep}
                        z
                        l${0} ${motionArrowStep}
                        l${0} ${-2 * motionArrowStep}
                        M${reflectorX + 0.5 * motionW} ${reflectorY + 0.5 * reflectorH + textShift}
                        l${-2 * motionArrowStep} ${-motionArrowStep}
                        l${0} ${2 * motionArrowStep}
                        z
                        l${0} ${motionArrowStep}
                        l${0} ${-2 * motionArrowStep}
                        `}
                      />
                    <text
                      x={reflectorX} y={reflectorY + 0.5 * reflectorH + 2 * textShift}
                      fontSize={fontSize} textAnchor="middle" dominantBaseline="hanging"
                      >
                      {(() => {
                        let axisName = '';
                        switch (configuration) {
                          case Configuration.SHARED_REFERENCE:
                            axisName = reflectionLabels[0] + reflectionLabels[index + 1];
                            break;
                          case Configuration.UNIQUE_REFERENCES:
                            axisName = reflectionLabels[2 * index] + reflectionLabels[2 * index + 1];
                            break;
                          default:
                            console.error(`Invalid configuration: ${configuration}. Not drawing motion labels.`);
                            return <></>;
                        }
                        return <>&Delta;x<tspan fontSize={0.8 * fontSize} dy={0.3 * fontSize}>{axisName}</tspan></>;
                      })()}
                    </text>
                    </React.Fragment>
                );
              })}
              {/* TODO: Draw delay lengths */}
              {/* TODO: Draw either normalized or actual lengths */}
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
