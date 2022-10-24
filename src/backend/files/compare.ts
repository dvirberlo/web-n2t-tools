import { zip } from '../common';

// ! trims the matching blocks to remove any common prefix or suffix
export async function* simpleLineCompare(
  ...lineReaders: AsyncGenerator<string, void, unknown>[]
): AsyncGenerator<boolean, void, unknown> {
  for await (const lines of zip<string>(lineReaders, false)) {
    const line = lines[0].trim();
    if (lines.some((l) => l.trim() !== line)) {
      yield false;
    }
    yield true;
  }
}

/**
 * Generates an array of opcodes describing how to turn a into b.
 * @param idealReader The ideal sequence to compare against.
 * @param actualReader The actual text.
 * @param strict Whether to continue comparing after one of the readers has exhausted.
 */
export async function* advancedLineCompare(
  idealReader: AsyncGenerator<string, void, unknown>,
  actualReader: AsyncGenerator<string, void, unknown>,
  strict: boolean = false
): AsyncGenerator<OpCode[], void, unknown> {
  for await (const [idealLine, actualLine] of zip<string>(
    [idealReader, actualReader],
    strict
  )) {
    yield await getOpcodes(actualLine, idealLine);
  }
}

export type OpCode = [
  'replace' | 'delete' | 'insert' | 'equal',
  number,
  number,
  number,
  number
];

/**
 *  ! The following functions are my own improvisations on the difflib python module (with some credits to copilot).
 *  TODO It might have to be optimized for performance.
 *  BTW, the whole process can be splited to multiple threads (line/block for each thread).
 */

/**
 * Generates an array of opcodes describing how to turn a into b.
 * @param a The actual text.
 * @param b The ideal sequence to compare against.
 * @returns A promise that resolves to an array of opcodes.
 */
async function getOpcodes(a: string, b: string): Promise<OpCode[]> {
  let i = 0,
    j = 0;
  const answer: OpCode[] = [];
  for (const [ai, bj, size] of await getMatchingBlocks(a, b)) {
    let tag: 'replace' | 'delete' | 'insert' | 'equal' = 'equal';
    if (i < ai && j < bj) {
      tag = 'replace';
    } else if (i < ai) {
      tag = 'delete';
    } else if (j < bj) {
      tag = 'insert';
    }
    if (tag) {
      answer.push([tag, i, ai, j, bj]);
    }
    i = ai + size;
    j = bj + size;
    if (size) {
      answer.push(['equal', ai, i, bj, j]);
    }
  }
  return answer;
}

async function getMatchingBlocks(
  a: string,
  b: string
): Promise<[number, number, number][]> {
  const la = a.length,
    lb = b.length;
  const queue: [number, number, number, number][] = [[0, la, 0, lb]];
  const matchingBlocks: [number, number, number][] = [];
  while (queue.length > 0) {
    const [alo, ahi, blo, bhi] = queue.pop()!;
    const [i, j, k] = await findLongestMatch(a, b, alo, ahi, blo, bhi);
    if (k !== 0) {
      matchingBlocks.push([i, j, k]);
      if (alo < i && blo < j) {
        queue.push([alo, i, blo, j]);
      }
      if (i + k < ahi && j + k < bhi) {
        queue.push([i + k, ahi, j + k, bhi]);
      }
    }
    matchingBlocks.sort((a, b) => a[0] - b[0]);
  }
  let [i1, j1, k1] = [0, 0, 0];
  const nonAdjacent: [number, number, number][] = [];
  for (const [i2, j2, k2] of matchingBlocks) {
    if (i1 + k1 === i2 && j1 + k1 === j2) {
      k1 += k2;
    } else {
      if (k1) {
        nonAdjacent.push([i1, j1, k1]);
      }
      [i1, j1, k1] = [i2, j2, k2];
    }
  }
  if (k1) {
    nonAdjacent.push([i1, j1, k1]);
  }
  nonAdjacent.push([la, lb, 0]);
  // ! self.matching_blocks = list(map(Match._make, non_adjacent))
  return nonAdjacent;
}

async function findLongestMatch(
  a: string,
  b: string,
  alo: number = 0,
  ahi: number = a.length,
  blo: number = 0,
  bhi: number = b.length
): Promise<[number, number, number]> {
  const s1 = [...a.slice(alo, ahi)];
  const s2 = [...b.slice(blo, bhi)];
  const arr = Array(s2.length + 1)
    .fill(null)
    .map(() => {
      return Array(s1.length + 1).fill(null);
    });
  for (let j = 0; j <= s1.length; j += 1) {
    arr[0][j] = 0;
  }
  for (let i = 0; i <= s2.length; i += 1) {
    arr[i][0] = 0;
  }
  let len = 0;
  let col = 0;
  let row = 0;
  for (let i = 1; i <= s2.length; i += 1) {
    for (let j = 1; j <= s1.length; j += 1) {
      if (s1[j - 1] === s2[i - 1]) {
        arr[i][j] = arr[i - 1][j - 1] + 1;
      } else {
        arr[i][j] = 0;
      }
      if (arr[i][j] > len) {
        len = arr[i][j];
        col = j;
        row = i;
      }
    }
  }
  if (len === 0) {
    return [alo, blo, 0];
  }
  let res = '';
  while (arr[row][col] > 0) {
    res = s1[col - 1] + res;
    row -= 1;
    col -= 1;
  }
  return [alo + col, blo + row, len];
}
