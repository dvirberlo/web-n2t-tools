// ? I think the error system here is fine, but it could be improved

import { FileService } from '../../services/file-service';
import { CommentsDumper, tryFile } from '../common/file-parser';

export type HdlIO = { [key: string]: number };
type HdlParams = [string, string][];

export class HdlRunner {
  public output: HdlIO[] = [];
  private constructor(
    public filePath: string,
    private dir: FileSystemDirectoryHandle,
    public statements: string[],
    public name: string,
    public inGates: Gate[],
    public outGates: Gate[],
    private idx: number,
    public input: HdlIO = {}
  ) {}
  static async create(
    filePath: string,
    inside?: FileSystemDirectoryHandle
  ): Promise<HdlRunner> {
    const [testDir, testFile] = await tryFile(
      filePath,
      FileService.getDirAndFile,
      inside
    );
    const testFileText = await testFile.text();
    const commentsDumper = new CommentsDumper();
    const lines = commentsDumper.dumps(testFileText).split(';');
    const [name, ins, outs, lineIdx] = parseDetails(lines);
    const runner = new HdlRunner(
      filePath,
      testDir,
      lines,
      name,
      ins,
      outs,
      lineIdx
    );
    return runner;
  }

  public async eval(input?: HdlIO): Promise<void> {
    this.input = input || this.input;

    const output = await this._hdlEval();
    this.output.push(structuredClone(output));
  }

  private async runChip(
    name: string,
    input: HdlIO,
    params: [string, string][]
  ): Promise<[HdlIO, Gate[]] | undefined> {
    // check if file exists
    const chipFile = await this.dir.getFileHandle(`${name}.hdl`);
    if (!chipFile) return undefined;
    const runner = await HdlRunner.create(`${name}.hdl`, this.dir);
    const scope: HdlIO = {};
    spreadParams(
      params,
      input,
      scope,
      (param) => runner.inGates.some((gate) => gate.name === param),
      false
    );
    await runner.eval(scope);
    return [runner.output[0], runner.outGates];
  }

  private async _hdlEval(): Promise<HdlIO> {
    let i = 0;
    try {
      for (i = this.idx; i < this.statements.length; i++) {
        const t = this.statements[i].split('}')[0].trim();
        if (t.length > 0) {
          await this._evalLine(t);
        }
      }
      return this.input;
      // filter out gates that are not in the outGates
      // return Object.fromEntries(
      //   Object.entries(this.input).filter(([key]) =>
      //     this.outGates.some((gate) => gate.name === key)
      //   )
      // );
    } catch (e) {
      throw (i > 0 ? `Error in line ${i}:\n` : '') + `${e}`;
    }
  }

  private async _evalLine(lineR: string): Promise<void> {
    try {
      let line = lineR.replace('PARTS:', '').trim();
      const chipName = line.split('(')[0];
      const params: [string, string][] = line
        .split('(')[1]
        .split(')')[0]
        .split(',')
        .map((gate) => {
          const split = gate.split('=');
          let [dest, src] = [split[0].trim(), split[1].trim()];
          return [dest, src];
        });
      let output: [HdlIO, Gate[]];
      if (BUILT_CHIPS[chipName] !== undefined)
        output = [
          await BUILT_CHIPS[chipName].run(
            this.input,
            BUILT_CHIPS[chipName],
            params
          ),
          BUILT_CHIPS[chipName].outGates,
        ];
      else {
        const o = await this.runChip(chipName, this.input, params);
        if (o === undefined) throw `Chip ${chipName} not found`;
        output = o;
      }

      spreadParams(
        params,
        output[0],
        this.input,
        (param) => output[1].some((gate: Gate) => gate.name === param),
        true
      );
    } catch (e) {
      throw `Could not parse or run:\n${lineR}\n${e}`;
    }
  }
}

function spreadParams(
  params: [string, string][],
  gates: HdlIO,
  mergeWith: HdlIO,
  includeParam: (param: string) => boolean = () => false,
  returnParams: boolean = false
): void {
  for (let [dest, src] of params) {
    if (returnParams) [dest, src] = [src, dest];
    let srcValue: number;
    const [srcName, srcIndex] = src
      .split('[')
      .map((s) => s.trim().replace(']', ''));
    const [destName, destIndex] = dest
      .split('[')
      .map((s) => s.trim().replace(']', ''));
    if (!includeParam(returnParams ? srcName : destName)) continue;

    if (srcIndex == undefined) {
      if (['true', '1'].includes(srcName)) srcValue = 1;
      else if (['false', '0'].includes(srcName)) srcValue = 0;
      else srcValue = gates[srcName];
    } else if (!srcIndex.includes('..')) {
      // gets the bit at bitIdx to the value of the param
      const num: number | undefined = gates[srcName];
      if (num === undefined)
        throw new Error(`Could not parse value of: ${srcName}`);
      const bitIdx = parseInt(srcIndex);
      const mask = 1 << bitIdx;
      srcValue = num & mask ? 1 : 0;
    } else {
      // gets the bits in the range to the value of the param
      const num: number | undefined = gates[srcName];
      if (num === undefined)
        throw new Error(`Could not parse value of: ${srcName}`);
      const [start, end] = srcIndex.split('..').map((s) => parseInt(s.trim()));
      const mask = (1 << (end - start + 1)) - 1;
      srcValue = (num >> start) & mask;
    }

    if (srcValue === undefined)
      throw new Error(`Could not parse value of: ${src}`);

    if (destIndex == undefined) {
      mergeWith[destName] = srcValue;
    } else if (!destIndex.includes('..')) {
      // sets the bit at bitIdx to the value of the param
      const num = mergeWith[destName] || 0;
      const bitIdx = parseInt(destIndex);
      const mask = 1 << bitIdx;
      mergeWith[destName] = (num & ~mask) | (srcValue << bitIdx);
    } else {
      // sets the bits in the range to the value of the param
      const num = mergeWith[destName] || 0;
      const [start, end] = destIndex.split('..').map((s) => parseInt(s.trim()));
      const mask = (1 << (end - start + 1)) - 1;
      mergeWith[destName] = (num & ~(mask << start)) | (srcValue << start);
    }
  }
}

class Gate {
  constructor(public name: string, public length: number = 1) {}
}

type RunChip = (
  inGates: HdlIO,
  chip: Chip,
  params: HdlParams
) => Promise<HdlIO>;

class Chip {
  public run: RunChip;
  constructor(
    public name: string,
    public inGates: Gate[],
    public outGates: Gate[],
    run: RunChip = async () => {
      return {};
    }
  ) {
    this.run = (inGates, chip, params) => {
      const scope: HdlIO = {};
      spreadParams(
        params,
        inGates,
        scope,
        (param) => chip.inGates.some((gate) => gate.name === param),
        false
      );
      // check if all inputs are defined
      for (const gate of chip.inGates) {
        if (scope[gate.name] === undefined) {
          throw new Error(`Missing input parameter: ${gate.name}`);
        }
      }
      return run(scope, chip, params);
    };
  }
}

function parseDetails(statements: string[]): [string, Gate[], Gate[], number] {
  let i = 0,
    name: string | undefined,
    inGates: Gate[] | undefined,
    outGates: Gate[] | undefined;
  let statement = statements[i].trim();
  name = statement.split('CHIP ', 2)[1].split('{', 1)[0].trim();
  statement = statement.split('{', 2)[1].trim();
  for (i = 1; i < statements.length; i++) {
    if (statement.length > 0) {
      if (statement.startsWith('CHIP')) name = statement.split(' ')[1];
      else if (statement.startsWith('IN'))
        inGates = parseGates(statement.slice(2));
      else if (statement.startsWith('OUT'))
        outGates = parseGates(statement.slice(3));
      else if (statement.startsWith('PARTS')) break;
    }
    statement = statements[i].trim();
  }
  if (name === undefined) throw new Error('Could not parse chip name');
  if (inGates === undefined) throw new Error('Could not parse chip IN section');
  if (outGates === undefined)
    throw new Error('Could not parse chip OUT section');
  return [name, inGates, outGates, i - 1];
}

function parseGates(gates: string): Gate[] {
  const result = gates.split(',').map((gate) => {
    const split = gate.split('[');
    return new Gate(
      split[0].trim(),
      split.length > 1 ? parseInt(split[1].slice(0, -1)) : 1
    );
  });
  return result;
}

const BUILT_CHIPS: {
  [chipName: string]: Chip;
} = {
  Nand: new Chip(
    'Nand',
    [new Gate('a'), new Gate('b')],
    [new Gate('out')],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      return { out: a & b ? 0 : 1 };
    }
  ),
  Not: new Chip('Not', [new Gate('in')], [new Gate('out')], async function (
    gatesScope,
    chip
  ) {
    const inGate = gatesScope['in'];
    return { out: inGate ? 0 : 1 };
  }),
  And: new Chip(
    'And',
    [new Gate('a'), new Gate('b')],
    [new Gate('out')],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      return { out: a & b ? 1 : 0 };
    }
  ),
  Or: new Chip(
    'Or',
    [new Gate('a'), new Gate('b')],
    [new Gate('out')],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      return { out: a | b ? 1 : 0 };
    }
  ),
  Xor: new Chip(
    'Xor',
    [new Gate('a'), new Gate('b')],
    [new Gate('out')],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      return { out: a ^ b ? 1 : 0 };
    }
  ),
  Mux: new Chip(
    'Mux',
    [new Gate('a'), new Gate('b'), new Gate('sel')],
    [new Gate('out')],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      const sel = gatesScope['sel'];
      return { out: sel ? b : a };
    }
  ),
  DMux: new Chip(
    'DMux',
    [new Gate('in'), new Gate('sel')],
    [new Gate('a'), new Gate('b')],
    async function (gatesScope, chip) {
      const inGate = gatesScope['in'];
      const sel = gatesScope['sel'];
      return { a: sel ? 0 : inGate, b: sel ? inGate : 0 };
    }
  ),

  Not16: new Chip(
    'Not16',
    [new Gate('in', 16)],
    [new Gate('out', 16)],
    async function (gatesScope, chip) {
      const inGate = gatesScope['in'];
      return { out: ~inGate & 0xffff };
    }
  ),
  And16: new Chip(
    'And16',
    [new Gate('a', 16), new Gate('b', 16)],
    [new Gate('out', 16)],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      return { out: a & b & 0xffff };
    }
  ),
  Or16: new Chip(
    'Or16',
    [new Gate('a', 16), new Gate('b', 16)],
    [new Gate('out', 16)],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      return { out: a | (b & 0xffff) };
    }
  ),
  Mux16: new Chip(
    'Mux16',
    [new Gate('a', 16), new Gate('b', 16), new Gate('sel')],
    [new Gate('out', 16)],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      const sel = gatesScope['sel'];
      return { out: sel ? b : a };
    }
  ),
  DMux16: new Chip(
    'DMux16',
    [new Gate('in', 16), new Gate('sel')],
    [new Gate('a', 16), new Gate('b', 16)],
    async function (gatesScope, chip) {
      const inGate = gatesScope['in'];
      const sel = gatesScope['sel'];
      return { a: sel ? 0 : inGate, b: sel ? inGate : 0 };
    }
  ),

  Or8Way: new Chip(
    'Or8Way',
    [new Gate('in', 8)],
    [new Gate('out')],
    async function (gatesScope, chip) {
      const inGate = gatesScope['in'];
      let out = 0;
      for (let i = 0; i < 8; i++) {
        out |= (inGate >> i) & 1;
      }
      return { out };
    }
  ),
  Mux4Way16: new Chip(
    'Mux4Way16',
    [
      new Gate('a', 16),
      new Gate('b', 16),
      new Gate('c', 16),
      new Gate('d', 16),
      new Gate('sel', 2),
    ],
    [new Gate('out', 16)],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      const c = gatesScope['c'];
      const d = gatesScope['d'];
      const sel = gatesScope['sel'];
      return { out: [a, b, c, d][sel] };
    }
  ),
  Mux8Way16: new Chip(
    'Mux8Way16',
    [
      new Gate('a', 16),
      new Gate('b', 16),
      new Gate('c', 16),
      new Gate('d', 16),
      new Gate('e', 16),
      new Gate('f', 16),
      new Gate('g', 16),
      new Gate('h', 16),
      new Gate('sel', 3),
    ],
    [new Gate('out', 16)],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      const c = gatesScope['c'];
      const d = gatesScope['d'];
      const e = gatesScope['e'];
      const f = gatesScope['f'];
      const g = gatesScope['g'];
      const h = gatesScope['h'];
      const sel = gatesScope['sel'];
      return { out: [a, b, c, d, e, f, g, h][sel] };
    }
  ),
  DMux4Way: new Chip(
    'DMux4Way',
    [new Gate('in'), new Gate('sel', 2)],
    [new Gate('a'), new Gate('b'), new Gate('c'), new Gate('d')],
    async function (gatesScope, chip) {
      const inGate = gatesScope['in'];
      const sel = gatesScope['sel'];
      const result = Object.fromEntries(
        chip.inGates.map((g, i) => [g.name, sel === i ? inGate : 0])
      );
      return result;
    }
  ),
  DMux8Way: new Chip(
    'DMux8Way',
    [new Gate('in'), new Gate('sel', 3)],
    [
      new Gate('a'),
      new Gate('b'),
      new Gate('c'),
      new Gate('d'),
      new Gate('e'),
      new Gate('f'),
      new Gate('g'),
      new Gate('h'),
    ],
    async function (gatesScope, chip) {
      const inGate = gatesScope['in'];
      const sel = gatesScope['sel'];
      const result = Object.fromEntries(
        chip.inGates.map((g, i) => [g.name, sel === i ? inGate : 0])
      );
      return result;
    }
  ),

  HalfAdder: new Chip(
    'HalfAdder',
    [new Gate('a'), new Gate('b')],
    [new Gate('sum'), new Gate('carry')],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      return { sum: a ^ b, carry: a & b };
    }
  ),
  FullAdder: new Chip(
    'FullAdder',
    [new Gate('a'), new Gate('b'), new Gate('c')],
    [new Gate('sum'), new Gate('carry')],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      const c = gatesScope['c'];
      return { sum: a ^ b ^ c, carry: (a & b) | (b & c) | (a & c) };
    }
  ),
  Add16: new Chip(
    'Add16',
    [new Gate('a', 16), new Gate('b', 16)],
    [new Gate('out', 16)],
    async function (gatesScope, chip) {
      const a = gatesScope['a'];
      const b = gatesScope['b'];
      return { out: (a + b) & 0xffff };
    }
  ),
  Inc16: new Chip(
    'Inc16',
    [new Gate('in', 16)],
    [new Gate('out', 16)],
    async function (gatesScope, chip) {
      const inGate = gatesScope['in'];
      return { out: (inGate + 1) & 0xffff };
    }
  ),
  ALU: new Chip(
    'ALU',
    [
      new Gate('x', 16),
      new Gate('y', 16),
      new Gate('zx'),
      new Gate('nx'),
      new Gate('zy'),
      new Gate('ny'),
      new Gate('f'),
      new Gate('no'),
    ],
    [new Gate('out', 16), new Gate('zr'), new Gate('ng')],
    async function (gatesScope, chip) {
      const x = gatesScope['x'];
      const y = gatesScope['y'];
      const zx = gatesScope['zx'];
      const nx = gatesScope['nx'];
      const zy = gatesScope['zy'];
      const ny = gatesScope['ny'];
      const f = gatesScope['f'];
      const no = gatesScope['no'];
      const x16 = zx ? 0 : x;
      const x16n = nx ? ~x16 & 0xffff : x16;
      const y16 = zy ? 0 : y;
      const y16n = ny ? ~y16 & 0xffff : y16;
      const out = f ? (x16n + y16n) & 0xffff : x16n & y16n;
      const outn = no ? ~out & 0xffff : out;
      return { out: outn, zr: outn === 0 ? 1 : 0, ng: (outn >> 15) & 1 };
    }
  ),
};
