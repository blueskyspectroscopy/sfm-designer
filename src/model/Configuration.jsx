import Constants from './Constants';

const Configuration = {
  SHARED_REFERENCE: 'SHARED_REFERENCE',
  UNIQUE_REFERENCES: 'UNIQUE_REFERENCES',
};

export default Configuration;

export function computeNumReflections({ configuration, numMeasurements }) {
  switch (configuration) {
    case Configuration.SHARED_REFERENCE:
      return numMeasurements + 1;
    case Configuration.UNIQUE_REFERENCES:
      return 2 * numMeasurements;
    default:
      console.error(`Invalid configuration: ${configuration}. Defaulting to 2 reflections.`);
      return 2;
  }
}

// This is a unitless value that describes the recommended bandwidth scaling.
//
// Recommended value taken from: A. Christiansen PhD thesis: https://hdl.handle.net/10133/6671.
// The thesis uses the symbol w for this parameter.
const bandSeparationCoefficient = 2.5;

// The Gaussian window width as the standard deviation.
//
// The recommended value taken from: T Kissinger PhD thesis. http://dspace.lib.cranfield.ac.uk/handle/1826/9598.
const sigma = 0.0225;

export function recommendedMinSeparation({ nuA }) {
  const minSeparationOpd = (bandSeparationCoefficient * Constants.speedOfLight) / (2 * Math.sqrt(2) * Math.PI ** 2 * nuA * sigma);
  return 0.5 * minSeparationOpd; // Multiply by 0.5 to convert from optical to mechanical.
}
