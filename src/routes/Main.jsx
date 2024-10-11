import React, { useContext } from 'react';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

import { TfiDownload, TfiPrinter } from 'react-icons/tfi';

import { DataContext } from '../App';
import Configuration, { recommendedMinSeparation } from '../model/Configuration';
import Constants from '../model/Constants';
import MathUtils from '../model/MathUtils';
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

  // The normalized lengths of all axes.
  const axisNormalizedLengths = (() => {
    let lengths = [];
    for (let i = 0; i < numReflections; i++) {
      for (let j = i + 1; j < numReflections; j++) {
        let s = SOLUTIONS[numReflections][solution].solution;
        lengths.push(Math.abs(s[i] - s[j]));
      }
    }
    return lengths;
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

  // TODO: Explain this.
  // TODO: Is this computed correctly? Is the 4 the right value?
  const recommendedMaxStroke = Math.min(minSeparation / 4, recommendedMinSeparation({ nuA }) / 4);

  // Design rule checks that are displayed as warnings.
  const warnings = [];
  if (minSeparation < recommendedMinSeparation({ nuA })) {
    warnings.push((
      <>
        The separation between axes, &Delta;x<sub>sep</sub>
        {' '}
        is smaller than the minimum recommended value of {MathUtils.roundTo(recommendedMinSeparation({ nuA }), 3)} m.
        {' '}
        Crosstalk may have a larger effect compared to recommended operating conditions.
      </>
    ));
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
    stroke: '#f9690e',
    strokeWidth: '6px',
  };
  const fibreStyle = {
    fill: 'none',
    stroke: '#4871f7',
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
    fill: '#af4154',
    stroke: '#af4154',
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
          <ButtonGroup className="mt-3 d-print-none user-select-none">
            <Button
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
            <Button
              variant="outline-primary"
              onClick={() => window.print()}
              >
                <TfiPrinter /> Print Summary
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
      <Row className="py-3">
        <Col>
          <h1>Summary</h1>
          <ul>
            <li>
              The laser is modulated with an optical frequency modulation amplitude of
              {' '}
              <strong>&nu;<sub>A</sub> = {nuA / 1e9} GHz</strong>
              {' '}
              at a modulation frequency of
              {' '}
              <strong>f<sub>m</sub> = {fM / 1e3} kHz</strong>
              .
            </li>
            <li>This SFM interferometer uses a <strong>{configuration.toLowerCase().replace('_', ' ')}</strong> configuration.</li>
            <li>
              <strong>Measurement{numMeasurements > 1 ? 's' : ''} of {numMeasurements} unique target{numMeasurements > 1 ? 's' : ''}</strong>
              {' '}
              {numMeasurements > 1 ? 'are' : 'is'} supported
              {' '}
              (out of a total <strong>{axisNames.length} interference axes</strong>).
            </li>
            <li>The minimum recommended mechanical separation between axes of <strong>x<sub>sep</sub> = {minSeparation} m</strong> is used.</li>
            <li>
              The maximum recommended mechanical stroke for all axes is <strong>&Delta;x<sub>max</sub> = {MathUtils.roundTo(recommendedMaxStroke, 3)} m</strong>.
              {' '}
              <span className="text-muted">
                (This is the same for all axes, e.g., &Delta;x<sub>max</sub> = &Delta;x<sub>&alpha;&beta;</sub> = &Delta;x<sub>&alpha;&gamma;</sub> = &hellip;)
              </span>
            </li>
            <li>The normalized length <strong>{SOLUTIONS[numReflections][solution].name}</strong> solution is used.</li>
          </ul>
        </Col>
      </Row>
      {warnings.length > 0 && (
        <Row className="py-3 bg-warning-subtle border border-warning rounded">
          <Col>
            <h1>Warnings</h1>
            <ul>
              {warnings.map((warning, index) => <li key={index}>{warning}</li>)}
            </ul>
          </Col>
        </Row>
      )}
      <Row className="pt-3">
        <Col>
          <h1>Interferometer Characteristics</h1>
          <p>The measurement axes are highlighted.</p>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Axis</th>
                <th>Normalized Length</th>
                <th>Mechanical Length (m)</th>
                <th>Beat Frequency Bandwidth (MHz)</th>
              </tr>
            </thead>
            <tbody>
              {axisNames.map((axisName, index) => {
                return (
                  <tr key={index} className={measurementNames.includes(axisName) ? 'bg-body-secondary' : ''}>
                    {/* The transparent background is necessary to show the tr background color. */}
                    <td className="bg-transparent">{axisName}</td>
                    <td className="bg-transparent">{axisNormalizedLengths[index]}</td>
                    <td className="bg-transparent">{MathUtils.roundTo(axisNormalizedLengths[index] * minSeparation, 3)}</td>
                    <td className="bg-transparent">{(() => {
                      // The factor of 2 is necessary to convert the mechanical length to the optical path difference.
                      let opd = axisNormalizedLengths[index] * minSeparation * 2;
                      // See Eq. 3.24 in: A. Christiansen. "A cryogenic multiaxis range-resolved laser interferometer". Doctoral thesis, University of Lethbridge, 2024. Handle: 10133/6671.
                      let fBeat = 2 * Math.PI * nuA * fM * opd / Constants.speedOfLight;
                      return MathUtils.roundTo(fBeat / 1e6, 1); // Convert to MHz.
                    })()}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}
