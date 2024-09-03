import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Configuration from '../model/Configuration';
import Dropdown from './Dropdown';
import Entry from './Entry';
import Logo from '../assets/logo.svg?react';

/* eslint-disable no-unused-vars */
const HZ_TO_KHZ = 1e-3;
const HZ_TO_MHZ = 1e-6;
const HZ_TO_GHZ = 1e-9;
const KHZ_TO_HZ = 1e3;
const MHZ_TO_HZ = 1e6;
const GHZ_TO_HZ = 1e9;
/* eslint-enable no-unused-vars */

// n is the number or descimal places.
const round_to = (x, n) => {
  const d = 10 ** n;
  return Math.round(d * x) / d;
}

export default function Sidebar({
    nuA, setNuA,
    fM, setFM,
    numberOfMeasurements, setNumberOfMeasurements,
    configuration, setConfiguration,
    maxStroke, setMaxStroke,
    minSeparation, setMinSeparation,
  }) {

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
    const minSep = round_to(0.5 * minSepOpd, 2);
    setAutomaticMinSeparation(minSep);
    if (!automaticMinSeparationOverride) {
      setMinSeparation(minSep);
    }
  };

  // Functions to update the exported state.
  const handleNuA = (e) => { setNuA(e.target.value * GHZ_TO_HZ), handleAutomaticMinSeparation() };
  const handleFM = (e) => setFM(e.target.value * KHZ_TO_HZ);
  const handleNumberOfMeasuremnts = (e) => setNumberOfMeasurements(e.target.value);
  const handleConfiguration = (e) => setConfiguration(e.target.value);
  const handleMaxStroke = (e) => setMaxStroke(e.target.value);
  const handleMinSeparation = (e) => {
    if (e.type == 'automaticvalue') {
      setMinSeparation(e.detail.value);
    } else {
      setMinSeparation(e.target.value);
    }
  }

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
        value={round_to(nuA * HZ_TO_GHZ, 6)} onChange={handleNuA}
        aria-label="Optical frequency modulation amplitude"
        />
      <Entry
        type="number" min={0} max={1000} step={1}
        prefix={<>f<sub>m</sub></>} suffix="kHz"
        value={round_to(fM * HZ_TO_KHZ, 6)} onChange={handleFM}
        aria-label="Modulation frequency"
        />
      <Dropdown
        prefix="Number of measurements"
        value={numberOfMeasurements} onChange={handleNumberOfMeasuremnts}
        aria-label="Number of desired simultaneous measurements"
        >
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
      </Dropdown>
      <Dropdown
        prefix="Configuration"
        value={configuration} onChange={handleConfiguration}
        aria-label="The interferometer configuration style"
        >
        <option value={Configuration.SHARED_REFERENCE}>Shared reference</option>
        <option value={Configuration.UNIQUE_REFERENCES}>Unique references</option>
      </Dropdown>
      <Entry
        type="number" min={0} max={10} step={0.01}
        prefix={<>&Delta;x<sub>max</sub></>} suffix="m"
        value={maxStroke} onChange={handleMaxStroke}
        aria-label="Maximum mechanical stroke to be measured" />
      <Entry
        type="number" min={0} max={10} step={0.01}
        prefix={<>&Delta;x<sub>sep</sub></>} suffix="m"
        value={minSeparation} onChange={handleMinSeparation}
        automaticValue={automaticMinSeparation} onOverrideChange={setAutomaticMinSeparationOverride}
        aria-label="Minimum mechanical separation between axes" />
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
};
