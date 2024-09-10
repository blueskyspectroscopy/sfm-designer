import React, { useContext } from 'react';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

import { TfiDownload } from 'react-icons/tfi';

import { DataContext } from '../App';
import Configuration from '../model/Configuration';
import SOLUTIONS from '../model/Solutions';

// The classic zip functions for an arbitrary number of arrays.
function zip(...args) {
  const range = [...Array(Math.min(...args.map((x) => x.length))).keys()];
  return range.map((i) => args.map((a) => a[i]));
}

// The single character labels that can be used for each reflection.
const reflectionLabels = 'αβγδεζηθικλμνξοπρστυφχψω';

// TODO: Remove 1x1 coupler when only 1 axis is used.
export default function Main() {
  const {
    nuA,
    fM,
    numMeasurements,
    configuration,
    maxStroke,
    minSeparation,
    solution,
    numReflections,
  } = useContext(DataContext);

  // This is an iterator over the number of measurements. It is used to compute
  // drawing values for each measurement.
  const measurements = [...Array(numMeasurements).keys()];

  // The names of all axes.
  const axisNames = (() => {
    let names = [];
    for (let i = 0; i < numReflections; i++) {
      for (let j = i + 1; j < numReflections; j++) {
        names.push(reflectionLabels[i] + reflectionLabels[j]);
      }
    }
    return names;
  })();

  // The names of the measurement axes.
  let measurementNames = measurements.map(() => '');
  switch (configuration) {
    case Configuration.SHARED_REFERENCE:
      measurementNames = measurements.map((index) => reflectionLabels[0] + reflectionLabels[index + 1]);
      break;
    case Configuration.UNIQUE_REFERENCES:
      measurementNames = measurements.map((index) => reflectionLabels[2 * index] + reflectionLabels[2 * index + 1]);
      break;
    default:
      console.error(`Invalid configuration: ${configuration}. Not drawing motion labels.`);
  }

  // Generic lengths.
  const padding = 50;

  // Lengths in the X direction.
  const leadFibreW = 150;
  const couplerW = 80;
  const connectingFibreW = 100 * (numMeasurements + 1);
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
    + standoffUnitW * numMeasurements
    // The right half of the reflector or motion line is used (whichever is larger).
    + 0.5 * Math.max(reflectorW, motionW)
  );
  const viewH = (
    + 2 * padding // Padding on the top and bottom.
    // The top and bottom collimators/reflectors each contribute half of their
    // heights.
    + Math.max(couplerH, collimatorH, reflectorH)
    // The rest is made up by the number of gaps.
    + (numMeasurements - 1) * collimatorReflectorYGap
  );

  // X positions to the centre of each element.
  const couplerX = padding + leadFibreW;
  const collimatorX = couplerX + connectingFibreW;
  const reflectorXs = measurements.map((m) => collimatorX + (m + 1) * standoffUnitW);

  // Y positions to the centre of each element.
  const couplerY = 0.5 * viewH;
  const collimatorYs = measurements.map((m) => {
    const gaps = numMeasurements - 1;
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
  const fibreBezierControlX = 50 * numMeasurements; // Horizontal control point distance for fibre curves.
  const inlineReflectorR = 20; // Radius of inline reflections.
  const reflectionLabelYShift = -Math.max(inlineReflectorR, collimatorH); // Vertical shift for reflection labels to pull them off the optical axis basline.
  const motionArrowStep = 5; // Half width of the motion arrows.
  const fontSize = 16 + 3 * numMeasurements; // Scales with measurements since the image increases in size.

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
        <Col className="pb-3">
          <h1>Schematic</h1>
          <div id="main-design" className="border">
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
                  1&times;{numMeasurements}
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
                        &Delta;x
                        <tspan fontSize={0.8 * fontSize} dy={0.3 * fontSize}>{measurementNames[index]}</tspan>
                    </text>
                    </React.Fragment>
                );
              })}
              {/* TODO: Draw delay lengths */}
              {/* TODO: Draw either normalized or actual lengths */}
            </svg>
          </div>
          <Button
            className="mt-3 d-print-none user-select-none"
            variant="outline-primary"
            onClick={() => {
              // Pull the SVG from the DOM and crudely minify it by removing spaces.
              const text = document.getElementById('main-design').innerHTML
                .replaceAll(/\s+/gi, ' ')
                .replaceAll(/\s*?"\s*?/gi, '"')
                .replaceAll(/\s*?<\s*?/gi, '<')
                .replaceAll(/\s*?>\s*?/gi, '>');
              // Create a temporary element that is used to download the SVG as a file.
              var element = document.createElement('a');
              element.style.display = 'none';
              element.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text));
              element.setAttribute('download', 'interferometer.svg');
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            >
              <TfiDownload /> Download SVG
          </Button>
        </Col>
      </Row>
      <Row className="py-3">
        <Col>
          <h1>Summary</h1>
          <ul>
            <li>This SFM interferometer uses a <strong>{configuration.toLowerCase().replace('_', ' ')}</strong> configuration.</li>
            <li><strong>Measurements of {numMeasurements} unique targets</strong> are supported (out of a total <strong>{axisNames.length} interference axes</strong>).</li>
            <li>The normalized length <strong>{SOLUTIONS[numReflections][solution].name}</strong> solution is used.</li>
          </ul>
          {/* TODO: Remove this */}
          <div className="d-none">
            <p>&nu;<sub>A</sub> = {nuA} Hz</p>
            <p>f<sub>m</sub> = {fM} Hz</p>
            <p>Max mechanical stroke = {maxStroke} m</p>
            <p>Mechanical separation between axes = {minSeparation} m</p>
          </div>
        </Col>
      </Row>
      <Row className="pt-3">
        <Col>
          <h1>Interferometer Characteristics</h1>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Axis</th>
                <th>Normalized Length</th>
                <th>Actual Length</th>
                <th>Beat Frequency Bandwidth</th>
              </tr>
            </thead>
            <tbody>
              {/* TODO Highlight the chosen axes somehow */}
              {axisNames.map((axisName, index) => {
                return (
                  <tr key={index} className={measurementNames.includes(axisName) ? 'bg-secondary-subtle' : ''}>
                    {/* The transparent background is necessary to show the tr background color. */}
                    <td className="bg-transparent">{axisName}</td>
                    <td className="bg-transparent"><span className="text-muted">Coming soon</span></td>
                    <td className="bg-transparent"><span className="text-muted">Coming soon</span></td>
                    <td className="bg-transparent"><span className="text-muted">Coming soon</span></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          {/* TODO: Remove this */}
        </Col>
      </Row>
    </Container>
  );
}
