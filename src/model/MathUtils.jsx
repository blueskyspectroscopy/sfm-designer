export default {
  // n is the number or decimal places.
  roundTo: (x, n) => {
    const d = 10 ** n;
    return Math.round(d * x) / d;
  },
};
