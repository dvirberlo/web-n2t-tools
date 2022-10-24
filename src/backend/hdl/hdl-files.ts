export type HdlProject = {
  name: string;
  files: {
    name: string;
    path: string;
    testPath: string;
  }[];
};
export type HdlFile = {
  name: string;
  path: string;
  testPath: string;
};

export const HDL_PROJECTS: HdlProject[] = [
  {
    name: 'Week 1',
    files: [
      { name: 'Not', path: '01/Not.hdl', testPath: '01/Not.tst' },
      { name: 'And', path: '01/And.hdl', testPath: '01/And.tst' },
      { name: 'Or', path: '01/Or.hdl', testPath: '01/Or.tst' },
      { name: 'Xor', path: '01/Xor.hdl', testPath: '01/Xor.tst' },
      { name: 'Mux', path: '01/Mux.hdl', testPath: '01/Mux.tst' },
      { name: 'DMux', path: '01/DMux.hdl', testPath: '01/DMux.tst' },
      { name: 'Not16', path: '01/Not16.hdl', testPath: '01/Not16.tst' },
      { name: 'And16', path: '01/And16.hdl', testPath: '01/And16.tst' },
      { name: 'Or16', path: '01/Or16.hdl', testPath: '01/Or16.tst' },
      { name: 'Mux16', path: '01/Mux16.hdl', testPath: '01/Mux16.tst' },
      { name: 'Or8Way', path: '01/Or8Way.hdl', testPath: '01/Or8Way.tst' },
      {
        name: 'Mux4Way16',
        path: '01/Mux4Way16.hdl',
        testPath: '01/Mux4Way16.tst',
      },
      {
        name: 'Mux8Way16',
        path: '01/Mux8Way16.hdl',
        testPath: '01/Mux8Way16.tst',
      },
      {
        name: 'DMux4Way',
        path: '01/DMux4Way.hdl',
        testPath: '01/DMux4Way.tst',
      },
      {
        name: 'DMux8Way',
        path: '01/DMux8Way.hdl',
        testPath: '01/DMux8Way.tst',
      },
    ],
  },
  {
    name: 'Week 2',
    files: [
      {
        name: 'HalfAdder',
        path: '02/HalfAdder.hdl',
        testPath: '02/HalfAdder.tst',
      },
      {
        name: 'FullAdder',
        path: '02/FullAdder.hdl',
        testPath: '02/FullAdder.tst',
      },
      { name: 'Add16', path: '02/Add16.hdl', testPath: '02/Add16.tst' },
      { name: 'Inc16', path: '02/Inc16.hdl', testPath: '02/Inc16.tst' },
      { name: 'ALU', path: '02/ALU.hdl', testPath: '02/ALU.tst' },
    ],
  },
  // not supoorted yet:
  {
    name: 'Week 3',
    files: [
      { name: 'Bit', path: '03/a/Bit.hdl', testPath: '03/a/Bit.tst' },
      {
        name: 'Register',
        path: '03/a/Register.hdl',
        testPath: '03/a/Register.tst',
      },
      { name: 'PC', path: '03/a/PC.hdl', testPath: '03/a/PC.tst' },
      { name: 'RAM8', path: '03/a/RAM8.hdl', testPath: '03/a/RAM8.tst' },
      { name: 'RAM64', path: '03/a/RAM64.hdl', testPath: '03/a/RAM64.tst' },
      { name: 'RAM512', path: '03/a/RAM512.hdl', testPath: '03/a/RAM512.tst' },
      { name: 'RAM4K', path: '03/a/RAM4K.hdl', testPath: '03/a/RAM4K.tst' },
    ],
  },
  {
    name: 'Week 5',
    files: [
      { name: 'CPU', path: '05/CPU.hdl', testPath: '05/CPU.tst' },
      {
        name: 'CPU-external',
        path: '05/CPU.hdl',
        testPath: '05/CPU-external.tst',
      },
      {
        name: 'ComputerAdd',
        path: '05/Computer.hdl',
        testPath: '05/ComputerAdd.tst',
      },
      {
        name: 'ComputerAdd-external',
        path: '05/Computer.hdl',
        testPath: '05/ComputerAdd-external.tst',
      },
      {
        name: 'ComputerMax',
        path: '05/Computer.hdl',
        testPath: '05/ComputerMax.tst',
      },
      {
        name: 'ComputerMax-external',
        path: '05/Computer.hdl',
        testPath: '05/ComputerMax-external.tst',
      },
      {
        name: 'ComputerRect',
        path: '05/Computer.hdl',
        testPath: '05/ComputerRect.tst',
      },
      {
        name: 'ComputerRect-external',
        path: '05/Computer.hdl',
        testPath: '05/ComputerRect-external.tst',
      },
      { name: 'Memory', path: '05/Memory.hdl', testPath: '05/Memory.tst' },
    ],
  },
];
