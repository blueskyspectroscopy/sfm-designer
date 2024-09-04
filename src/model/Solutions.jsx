// Each key in the solution is the number of reflections in the interferometer.
const SOLUTIONS = {
  2: [
    { value: 0, solution: [0, 1], name: '[0, 1]', },
  ],
  3: [
    { value: 0, solution: [0, 1, 3], name: '[0, 1, 3]', },
    { value: 1, solution: [0, 2, 3], name: '[0, 2, 3]', },
  ],
  4: [
    { value: 0, solution: [0, 1, 4, 6], name: '[0, 1, 4, 6]', },
    { value: 1, solution: [0, 2, 5, 6], name: '[0, 2, 5, 6]', },
  ],
  5: [
    { value: 0, solution: [0, 1, 4, 9, 11], name: '[0, 1, 4, 9, 11]', },
    { value: 1, solution: [0, 2, 7, 8, 11], name: '[0, 2, 7, 8, 11]', },
    { value: 2, solution: [0, 2, 7, 10, 11], name: '[0, 2, 7, 10, 11]', },
    { value: 3, solution: [0, 3, 4, 9, 11], name: '[0, 3, 4, 9, 11]', },
  ],
  6: [
    { value: 0, solution: [0, 1, 4, 10, 12, 17], name: '[0, 1, 4, 10, 12, 17]', },
    { value: 1, solution: [0, 1, 4, 10, 15, 17], name: '[0, 1, 4, 10, 15, 17]', },
    { value: 2, solution: [0, 1, 8, 11, 13, 17], name: '[0, 1, 8, 11, 13, 17]', },
    { value: 3, solution: [0, 1, 8, 12, 14, 17], name: '[0, 1, 8, 12, 14, 17]', },
    { value: 4, solution: [0, 2, 7, 13, 16, 17], name: '[0, 2, 7, 13, 16, 17]', },
    { value: 5, solution: [0, 3, 5, 9, 16, 17], name: '[0, 3, 5, 9, 16, 17]', },
    { value: 6, solution: [0, 4, 6, 9, 16, 17], name: '[0, 4, 6, 9, 16, 17]', },
    { value: 7, solution: [0, 5, 7, 13, 16, 17], name: '[0, 5, 7, 13, 16, 17]', },
  ],
};

export default SOLUTIONS;
