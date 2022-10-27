export type HdlProject = {
  name: string;
  files: HdlFile[];
};
export type HdlFile = {
  name: string;
  testPath: string;
};

export const HDL_PROJECTS: HdlProject[] = [
  {
    name: 'Week 1',
    files: [
      { name: 'Not', testPath: '01/Not.tst' },
      { name: 'And', testPath: '01/And.tst' },
      { name: 'Or', testPath: '01/Or.tst' },
      { name: 'Xor', testPath: '01/Xor.tst' },
      { name: 'Mux', testPath: '01/Mux.tst' },
      { name: 'DMux', testPath: '01/DMux.tst' },
      { name: 'Not16', testPath: '01/Not16.tst' },
      { name: 'And16', testPath: '01/And16.tst' },
      { name: 'Or16', testPath: '01/Or16.tst' },
      { name: 'Mux16', testPath: '01/Mux16.tst' },
      { name: 'Or8Way', testPath: '01/Or8Way.tst' },
      {
        name: 'Mux4Way16',
        testPath: '01/Mux4Way16.tst',
      },
      {
        name: 'Mux8Way16',
        testPath: '01/Mux8Way16.tst',
      },
      {
        name: 'DMux4Way',
        testPath: '01/DMux4Way.tst',
      },
      {
        name: 'DMux8Way',

        testPath: '01/DMux8Way.tst',
      },
    ],
  },
  {
    name: 'Week 2',
    files: [
      {
        name: 'HalfAdder',

        testPath: '02/HalfAdder.tst',
      },
      {
        name: 'FullAdder',

        testPath: '02/FullAdder.tst',
      },
      { name: 'Add16', testPath: '02/Add16.tst' },
      { name: 'Inc16', testPath: '02/Inc16.tst' },
      { name: 'ALU', testPath: '02/ALU.tst' },
    ],
  },
  // not supoorted yet:
  {
    name: 'Week 3',
    files: [
      { name: 'Bit', testPath: '03/a/Bit.tst' },
      {
        name: 'Register',

        testPath: '03/a/Register.tst',
      },
      { name: 'PC', testPath: '03/a/PC.tst' },
      { name: 'RAM8', testPath: '03/a/RAM8.tst' },
      { name: 'RAM64', testPath: '03/a/RAM64.tst' },
      { name: 'RAM512', testPath: '03/a/RAM512.tst' },
      { name: 'RAM4K', testPath: '03/a/RAM4K.tst' },
    ],
  },
  {
    name: 'Week 5',
    files: [
      { name: 'CPU', testPath: '05/CPU.tst' },
      {
        name: 'CPU-external',
        testPath: '05/CPU-external.tst',
      },
      {
        name: 'ComputerAdd',
        testPath: '05/ComputerAdd.tst',
      },
      {
        name: 'ComputerAdd-external',
        testPath: '05/ComputerAdd-external.tst',
      },
      {
        name: 'ComputerMax',
        testPath: '05/ComputerMax.tst',
      },
      {
        name: 'ComputerMax-external',
        testPath: '05/ComputerMax-external.tst',
      },
      {
        name: 'ComputerRect',
        testPath: '05/ComputerRect.tst',
      },
      {
        name: 'ComputerRect-external',
        testPath: '05/ComputerRect-external.tst',
      },
      { name: 'Memory', testPath: '05/Memory.tst' },
    ],
  },
];
