import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { DataContext } from '../App';
import Configuration, { computeNumReflections } from '../model/Configuration';
import Dropdown from './Dropdown';
import Entry from './Entry';
import Logo from '../assets/logo.svg?react';
import Constants from '../model/Constants';
import MathUtils from '../model/MathUtils';
import SOLUTIONS from '../model/Solutions';

/* eslint-disable no-unused-vars */
const HZ_TO_KHZ = 1e-3;
const HZ_TO_MHZ = 1e-6;
const HZ_TO_GHZ = 1e-9;
const KHZ_TO_HZ = 1e3;
const MHZ_TO_HZ = 1e6;
const GHZ_TO_HZ = 1e9;
/* eslint-enable no-unused-vars */

export default function Sidebar() {
  const {
    nuA, setNuA,
    fM, setFM,
    numMeasurements, setNumMeasurements,
    configuration, setConfiguration,
    maxStroke, setMaxStroke,
    minSeparation, setMinSeparation,
    solution, setSolution,
    numReflections, setNumReflections,
  } = useContext(DataContext);

  // The minimum separation is automatically updated when the nuA input is
  // changed. Some extra logic is required for that.
  const [automaticMinSeparation, setAutomaticMinSeparation] = useState(0);
  const [automaticMinSeparationOverride, setAutomaticMinSeparationOverride] = useState(false);
  const handleAutomaticMinSeparation = () => {
    // TODO Put w in constants?
    const w = 2.5; // Recommended from A. Christiansen PhD thesis: https://hdl.handle.net/10133/6671.
    const sigma = 0.0225; // TODO Put sigma in a state or Constants.
    const minSepOpd = (w * Constants.speedOfLight) / (2 * Math.sqrt(2) * Math.PI ** 2 * nuA * sigma);
    // Multiply by 0.5 to convert from optical to mechanical.
    const minSep = MathUtils.roundTo(0.5 * minSepOpd, 2);
    setAutomaticMinSeparation(minSep);
    if (!automaticMinSeparationOverride) {
      setMinSeparation(minSep);
    }
  };

  // TODO: move MathUtils.roundTo calls into here.
  // Functions to update the exported state.
  const handleNuA = (e) => {
    setNuA(e.target.value * GHZ_TO_HZ);
    handleAutomaticMinSeparation();
  };
  const handleFM = (e) => setFM(e.target.value * KHZ_TO_HZ);
  const handleNumMeasuremnts = (e) => {
    setNumMeasurements(parseInt(e.target.value));
    setNumReflections(computeNumReflections({
      configuration, numMeasurements: parseInt(e.target.value)
    }));
    setSolution(0);
  };
  const handleConfiguration = (e) => {
    setConfiguration(e.target.value);
    setNumReflections(computeNumReflections({
      configuration: e.target.value, numMeasurements,
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
        value={MathUtils.roundTo(nuA * HZ_TO_GHZ, 6)} onChange={handleNuA}
        aria-label="Optical frequency modulation amplitude"
        />
      <Entry
        type="number" min={0} max={1000} step={1}
        prefix={<>f<sub>m</sub></>} suffix="kHz"
        value={MathUtils.roundTo(fM * HZ_TO_KHZ, 6)} onChange={handleFM}
        aria-label="Modulation frequency"
        />
      <Dropdown
        prefix="Number of measurements"
        value={numMeasurements} onChange={handleNumMeasuremnts}
        options={(()=>{
          let maxSolutionSize = Math.max.apply(null, Object.keys(SOLUTIONS));
          return [...Array(maxSolutionSize / 2).keys()].map((key) => ({value: key + 1, name: `${key + 1}`}));
        })()}
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
      {/* TODO: deselecting override always sets this to 0 */}
      <Entry
        type="number" min={0} max={10} step={0.01}
        prefix={<>x<sub>sep</sub></>} suffix="m"
        value={minSeparation} onChange={handleMinSeparation}
        automaticValue={automaticMinSeparation} onOverrideChange={setAutomaticMinSeparationOverride}
        aria-label="Minimum mechanical separation between axes"
        />
      <Dropdown
        prefix="Solution"
        value={solution} onChange={handleSolution}
        onCycle={setSolution}
        options={SOLUTIONS[numReflections]}
        aria-label="Solution for a number of measurements and configuration"
        />
    </>
  );
}
