import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Configuration from '../model/Configuration';
import Dropdown from './Dropdown';
import Entry from './Entry';
import Logo from '../assets/logo.svg?react';
import SOLUTIONS from '../model/Solutions';

/* eslint-disable no-unused-vars */
const HZ_TO_KHZ = 1e-3;
const HZ_TO_MHZ = 1e-6;
const HZ_TO_GHZ = 1e-9;
const KHZ_TO_HZ = 1e3;
const MHZ_TO_HZ = 1e6;
const GHZ_TO_HZ = 1e9;
/* eslint-enable no-unused-vars */

// n is the number or descimal places.
const roundTo = (x, n) => {
  const d = 10 ** n;
  return Math.round(d * x) / d;
}

const computeNumberOfReflections = ({ configuration, numberOfMeasurements }) => {
  switch (configuration) {
    case Configuration.SHARED_REFERENCE:
      return numberOfMeasurements + 1;
    case Configuration.UNIQUE_REFERENCES:
      return 2 * numberOfMeasurements;
    default:
      console.log(`Invalid configuration: ${configuration}. Defaulting to 2 reflections.`);
      return 2;
  }
}

export default function Sidebar({
    nuA, setNuA,
    fM, setFM,
    numberOfMeasurements, setNumberOfMeasurements,
    configuration, setConfiguration,
    maxStroke, setMaxStroke,
    minSeparation, setMinSeparation,
    solution, setSolution,
  }) {

  // The solution set to draw from.
  const [numberOfReflections, setNumberOfReflections] = useState(3);

  // The minimum separation is automatically updated when the nuA input is
  // changed. Some extra logic is required for that.
  const [automaticMinSeparation, setAutomaticMinSeparation] = useState(0);
  const [automaticMinSeparationOverride, setAutomaticMinSeparationOverride] = useState(false);
  const handleAutomaticMinSeparation = () => {
    const c = 299792458; // m/s.
    const w = 2.5; // Recommended from A. Christiansen PhD thesis: https://hdl.handle.net/10133/6671.
    const sigma = 0.0225; // TODO Put sigma in a state.
    const minSepOpd = (w * c) / (2 * Math.sqrt(2) * Math.PI ** 2 * nuA * sigma);
    // Multiply by 0.5 to convert from optical to mechanical.
    const minSep = roundTo(0.5 * minSepOpd, 2);
    setAutomaticMinSeparation(minSep);
    if (!automaticMinSeparationOverride) {
      setMinSeparation(minSep);
    }
  };

  // TODO: move roundTo calls into here.
  // Functions to update the exported state.
  const handleNuA = (e) => {
    setNuA(e.target.value * GHZ_TO_HZ);
    handleAutomaticMinSeparation();
  };
  const handleFM = (e) => setFM(e.target.value * KHZ_TO_HZ);
  const handleNumberOfMeasuremnts = (e) => {
    setNumberOfMeasurements(parseInt(e.target.value));
    setNumberOfReflections(computeNumberOfReflections({
      configuration, numberOfMeasurements: parseInt(e.target.value)
    }));
    setSolution(0);
  };
  const handleConfiguration = (e) => {
    setConfiguration(e.target.value);
    setNumberOfReflections(computeNumberOfReflections({
      configuration: e.target.value, numberOfMeasurements,
    }));
    setSolution(0);
  }
  const handleMaxStroke = (e) => setMaxStroke(e.target.value);
  const handleMinSeparation = (e) => {
    if (e.type == 'automaticvalue') {
      setMinSeparation(e.detail.value);
    } else {
      setMinSeparation(e.target.value);
    }
  }
  const handleSolution = (e) => setSolution(e.target.value);

  return (
    <>
      <nav className="d-block">
        <Link to="/" className="text-decoration-none text-body">
          <h1 className="fs-3">
            <Logo className="d-inline me-3" style={{height: '1.5em', marginBottom: '0.2em'}} />
            SFM Designer
          </h1>
        </Link>
        <p className="text-muted">
          A calculator for sinusoidal frequency modulation (SFM) interferometer layouts.
        </p>
      </nav>
      <Entry
        type="number" min={0} max={100} step={0.1}
        prefix={<>&nu;<sub>A</sub></>} suffix="GHz"
        value={roundTo(nuA * HZ_TO_GHZ, 6)} onChange={handleNuA}
        aria-label="Optical frequency modulation amplitude"
        />
      <Entry
        type="number" min={0} max={1000} step={1}
        prefix={<>f<sub>m</sub></>} suffix="kHz"
        value={roundTo(fM * HZ_TO_KHZ, 6)} onChange={handleFM}
        aria-label="Modulation frequency"
        />
      <Dropdown
        prefix="Number of measurements"
        value={numberOfMeasurements} onChange={handleNumberOfMeasuremnts}
        options={[
          { value: 1, name: '1' },
          { value: 2, name: '2' },
          { value: 3, name: '3' },
        ]}
        aria-label="Number of desired simultaneous measurements"
        />
      <Dropdown
        prefix="Configuration"
        value={configuration} onChange={handleConfiguration}
        options={[
          { value: Configuration.SHARED_REFERENCE, name: 'Shared reference' },
          { value: Configuration.UNIQUE_REFERENCES, name: 'Unique references' },
        ]}
        aria-label="The interferometer configuration style"
        />
      <Entry
        type="number" min={0} max={10} step={0.01}
        prefix={<>&Delta;x<sub>max</sub></>} suffix="m"
        value={maxStroke} onChange={handleMaxStroke}
        aria-label="Maximum mechanical stroke to be measured"
        />
      <Entry
        type="number" min={0} max={10} step={0.01}
        prefix={<>&Delta;x<sub>sep</sub></>} suffix="m"
        value={minSeparation} onChange={handleMinSeparation}
        automaticValue={automaticMinSeparation} onOverrideChange={setAutomaticMinSeparationOverride}
        aria-label="Minimum mechanical separation between axes"
        />
      <Dropdown
        prefix="Solution"
        value={solution} onChange={handleSolution}
        onCycle={setSolution}
        options={SOLUTIONS[numberOfReflections]}
        aria-label="Solution for a number of measurements and configuration"
        />
    </>
  );
}

Sidebar.propTypes = {
  nuA: PropTypes.number.isRequired,
  setNuA: PropTypes.func.isRequired,
  fM: PropTypes.number.isRequired,
  setFM: PropTypes.func.isRequired,
  numberOfMeasurements: PropTypes.number.isRequired,
  setNumberOfMeasurements: PropTypes.func.isRequired,
  configuration: PropTypes.number.isRequired,
  setConfiguration: PropTypes.func.isRequired,
  maxStroke: PropTypes.number.isRequired,
  setMaxStroke: PropTypes.func.isRequired,
  minSeparation: PropTypes.number.isRequired,
  setMinSeparation: PropTypes.func.isRequired,
  solution: PropTypes.object.isRequired,
  setSolution: PropTypes.func.isRequired,
};
