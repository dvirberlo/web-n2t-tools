// ? I think the error system here is fine, but it could be improved

import { lineReader } from '../files/file-lines-reader';
import { getDir, getFile, getFileAndDir } from '../files/files';
import { HdlFile } from './hdl-files';

export async function hdlTest(
  dirHandler: FileSystemDirectoryHandle,
  hdl: HdlFile,
  inGates: { [name: string]: number },
  multiFile: boolean = true
): Promise<{ [key: string]: number }> {
  try {
    const [hdlFile, hdlDir] = await getFileAndDir(dirHandler, hdl.path);
    return await _hdlTest(
      hdlDir,
      hdlFile.name.slice(0, -4),
      inGates,
      multiFile
    );
  } catch (e) {
    if (e instanceof DOMException && e.name === 'NotFoundError') {
      throw `Could not read file: ${e.message}`;
    }
    throw e;
  }
}

class CommentsDumper {
  constructor(private _insideComment: boolean = false, public lineCount = 0) {}

  public dump(line: string): string {
    this.lineCount++;
    let result: string = '';
    if (this._insideComment) {
      const commentEnd = line.indexOf('*/');
      if (commentEnd !== -1) {
        this._insideComment = false;
        result = line.slice(commentEnd + 2);
      } else {
        return '';
      }
    } else {
      const commentStart = line.indexOf('/*');
      if (commentStart !== -1) {
        this._insideComment = true;
        result = line.slice(0, commentStart);
      } else {
        result = line;
      }
    }
    return result.split('//')[0].trim();
  }
}
class Gate {
  constructor(public name: string, public length: number = 1) {}
}

type RunChip = (
  inGates: {
    [name: string]: number;
  },
  chip: Chip
) => Promise<{ [name: string]: number }>;

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
    this.run = (inGates, chip) => {
      // check if all inputs are defined
      for (const gate of chip.inGates) {
        if (inGates[gate.name] === undefined) {
          throw new Error(`Missing input parameter: ${gate.name}`);
        }
      }
      return run(inGates, chip);
    };
  }
}

/**
 * Runs a chip with the given parameters
 * @param hdlDir The directory containing the hdl files
 * @param hdlName The name of the hdl file
 * @param inGates The input gates
 * @param multiFile Should search for chips in other files in the hdlDir
 * @returns The output gates
 */
async function _hdlTest(
  hdlDir: FileSystemDirectoryHandle,
  hdlName: string,
  inGates: { [name: string]: number },
  multiFile: boolean = true
): Promise<{ [key: string]: number }> {
  let lines;
  try {
    lines = lineReader(await getFile(hdlDir, `${hdlName}.hdl`));
  } catch (e) {
    throw `Could not read file: ${hdlName}.hdl`;
  }
  if (!multiFile) return hdlTestFile(lines, inGates);
  return await hdlTestFile(lines, inGates, async (name) => {
    // check if there is a file with the name
    const chipFile = await hdlDir.getFileHandle(`${name}.hdl`);
    if (!chipFile) return undefined;
    const chip = await _getChipDetails(
      lineReader(await chipFile.getFile()),
      new CommentsDumper()
    );
    chip.run = async (inGates, chip) => {
      return await _hdlTest(hdlDir, name, inGates, false);
    };
    return chip;
  });
}

async function hdlTestFile(
  lineReader: AsyncGenerator<string, void, unknown>,
  inGates: { [key: string]: number },
  getChip?: (name: string) => Promise<Chip | undefined>
): Promise<{ [key: string]: number }> {
  const commentsDumper = new CommentsDumper();
  try {
    const chip: Chip | undefined = await _getChipDetails(
      lineReader,
      commentsDumper
    );

    const gates: { [key: string]: number } = structuredClone(inGates);
    let lineR: IteratorResult<string, void>;
    while (
      !(lineR = await lineReader.next()).done &&
      !lineR.value.startsWith('}')
    ) {
      const line = commentsDumper.dump(lineR.value);
      if (line.length > 0) {
        await _parsePartsLine(line, gates, getChip);
      }
    }
    // filter out gates that are not in the outGates
    return Object.fromEntries(
      Object.entries(gates).filter(([key]) =>
        chip.outGates.some((gate) => gate.name === key)
      )
    );
  } catch (e) {
    throw `Error in line ${commentsDumper.lineCount}:\n${e}`;
  }
}

async function _getChipDetails(
  lineReader: AsyncGenerator<string, void, unknown>,
  commentsDumper: CommentsDumper
): Promise<Chip> {
  let lineR: IteratorResult<string, void>,
    name: string | undefined,
    inGates: Gate[] | undefined,
    outGates: Gate[] | undefined;
  while (!(lineR = await lineReader.next()).done) {
    const line = commentsDumper.dump(lineR.value);
    if (line.length > 0) {
      if (line.startsWith('CHIP')) {
        name = line.split(' ')[1];
      } else if (line.startsWith('IN')) {
        inGates = _getGates(
          await _gatherUntil(lineReader, commentsDumper, ';', line.slice(2))
        );
      } else if (line.startsWith('OUT')) {
        outGates = _getGates(
          await _gatherUntil(lineReader, commentsDumper, ';', line.slice(3))
        );
      } else if (line.startsWith('PARTS')) {
        break;
      }
    }
  }
  if (name === undefined) throw new Error('Could not parse chip name');
  if (inGates === undefined) throw new Error('Could not parse chip IN section');
  if (outGates === undefined)
    throw new Error('Could not parse chip OUT section');
  return new Chip(name, inGates, outGates);
}
async function _gatherUntil(
  lineReader: AsyncGenerator<string, void, unknown>,
  commentsDumper: CommentsDumper,
  until: string,
  first: string = ''
): Promise<string> {
  let lineR: IteratorResult<string, void>,
    result = first;
  if (result.includes(until)) return result.slice(0, result.indexOf(until));
  while (!(lineR = await lineReader.next()).done) {
    const line = commentsDumper.dump(lineR.value);
    result += line;
    if (line.includes(until)) break;
  }
  return result.slice(0, result.indexOf(until));
}
function _getGates(gates: string): Gate[] {
  const result = gates.split(',').map((gate) => {
    const split = gate.split('[');
    return new Gate(
      split[0].trim(),
      split.length > 1 ? parseInt(split[1].slice(0, -1)) : 1
    );
  });
  return result;
}

async function _parsePartsLine(
  lineR: string,
  gates: { [key: string]: number },
  getChip: (name: string) => Promise<Chip | undefined> = async (name) =>
    undefined
): Promise<void> {
  try {
    let line = lineR.split(';')[0];
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
    const chip: Chip | undefined = chips[chipName] || (await getChip(chipName));
    if (chip === undefined) throw new Error(`Chip not found: ${chipName}`);
    await _runChip(chip, params, gates);
  } catch (e) {
    throw `Could not parse or run:\n${lineR}\n${e}`;
  }
}

async function _runChip(
  chip: Chip,
  params: [string, string][],
  gates: { [key: string]: number }
): Promise<void> {
  const inGatesNames = chip.inGates.map((gate) => gate.name);
  const inGates: { [key: string]: number } = {};
  _spreadParams(params, gates, inGates, (param) =>
    inGatesNames.includes(param)
  );

  const outGates = await chip.run(inGates, chip);

  const outGatesNames = chip.outGates.map((gate) => gate.name);
  _spreadParams(
    params,
    outGates,
    gates,
    (param) => outGatesNames.includes(param),
    true
  );
}

function _spreadParams(
  params: [string, string][],
  gates: { [key: string]: number },
  mergeWith: { [key: string]: number },
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
const chips: {
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
