const Configuration = {
  SHARED_REFERENCE: 'SHARED_REFERENCE',
  UNIQUE_REFERENCES: 'UNIQUE_REFERENCES',
};

export default Configuration;

export function computeNumberOfReflections({ configuration, numberOfMeasurements }) {
  switch (configuration) {
    case Configuration.SHARED_REFERENCE:
      return numberOfMeasurements + 1;
    case Configuration.UNIQUE_REFERENCES:
      return 2 * numberOfMeasurements;
    default:
      console.error(`Invalid configuration: ${configuration}. Defaulting to 2 reflections.`);
      return 2;
  }
}
