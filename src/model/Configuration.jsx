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
