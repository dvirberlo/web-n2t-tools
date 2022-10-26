// ts version of ./assembler.py

class SymbolTable {
  private _table: { [key: string]: number } = {
    SP: 0,
    LCL: 1,
    ARG: 2,
    THIS: 3,
    THAT: 4,

    R0: 0,
    R1: 1,
    R2: 2,
    R3: 3,
    R4: 4,
    R5: 5,
    R6: 6,
    R7: 7,
    R8: 8,
    R9: 9,
    R10: 10,
    R11: 11,
    R12: 12,
    R13: 13,
    R14: 14,
    R15: 15,

    SCREEN: 16384,
    KBD: 24576,
  };
  private _next: number = 16;

  constructor() {}

  private get(name: string): number | undefined {
    return this._table[name];
  }

  public setLabel(name: string, value: number): void {
    this._table[name] = value;
  }

  private setVar(name: string): number {
    this._table[name] = this._next;
    this._next++;
    return this._table[name];
  }

  public toBin(value: string): string {
    const num = parseInt(value);
    if (isNaN(num)) {
      let result = this.get(value);
      if (result === undefined) {
        result = this.setVar(value);
      }
      return result.toString(2).padStart(15, '0');
    } else return num.toString(2).padStart(15, '0');
  }
}

export async function* asmParse(
  getLineReader: () => AsyncGenerator<string, void, unknown>
): AsyncGenerator<[string, string], void, unknown> {
  // it is actually reading the file twice, so if the file is changed in between it will be a problem
  // TODO maybe there is a way to lock the file from being changed while reading it
  const symbolTable = await asmLabels(await getLineReader());
  const lineReader = await getLineReader();
  for await (const lineR of lineReader) {
    const line = lineR.trim().split('//')[0];
    // TODO right now it is skipping empty/labels lines, but maybe it should yield an empty line
    if (line.length === 0 || line.startsWith('(')) continue;
    if (line.startsWith('@')) {
      yield [lineR, `0${symbolTable.toBin(line.slice(1))}`];
    } else {
      let comp = line,
        dest = '',
        jump = '';
      if (line.includes('=')) {
        [dest, comp] = line.split('=');
      } else if (line.includes(';')) {
        [comp, jump] = line.split(';');
      }
      yield [
        lineR,
        '111' +
          binBool(comp.includes('M')) +
          compTable[comp.trim().replace('M', 'A')] +
          binBool(dest.includes('A')) +
          binBool(dest.includes('D')) +
          binBool(dest.includes('M')) +
          jumpTable[jump.trim()],
      ];
    }
  }
}

async function asmLabels(
  lineReader: AsyncGenerator<string, void, unknown>
): Promise<SymbolTable> {
  const symbolTable = new SymbolTable();
  let lineNum = 0;
  for await (const lineR of lineReader) {
    const line = lineR.trim();
    if (line.startsWith('(')) {
      symbolTable.setLabel(line.slice(1, -1), lineNum);
    } else if (line.length > 0 && !line.startsWith('//')) {
      lineNum++;
    }
  }
  return symbolTable;
}

function binBool(b: boolean): string {
  return b ? '1' : '0';
}

const compTable: { [key: string]: string } = {
    '0': '101010',
    '1': '111111',
    '+1': '111111',
    '-1': '111010',

    D: '001100',
    A: '110000',

    '!D': '001101',
    '!A': '110001',

    '-D': '001111',
    '-A': '110011',

    'D+1': '011111',
    '1+D': '011111',
    'A+1': '110111',
    '1+A': '110111',

    'D-1': '001110',
    'A-1': '110010',

    'D+A': '000010',
    'A+D': '000010',

    'D-A': '010011',
    'A-D': '000111',

    'D&A': '000000',
    'A&D': '000000',

    'D|A': '010101',
    'A|D': '010101',
  },
  jumpTable: { [key: string]: string } = {
    JMP: '111',
    JGE: '011',
    JGT: '001',
    JNE: '101',
    JEQ: '010',
    JLE: '110',
    JLT: '100',
    '': '000',
  };
