import { simpleLineCompare } from '../files/compare';
import { lineReader } from '../files/file-lines-reader';
import { getFile } from '../files/files';
import { AsmCmpFile } from './asm-cmp-files';
import { asmParse } from './assembler';

/**
 * Compares the output of the assembler with the expected output
 * @param dirHandler the directory handler
 * @param asmFile the asm file to compile and compare
 * @returns array of lines that are different
 */
export async function fullCompareAsmFile(
  dirHandler: FileSystemDirectoryHandle,
  asmFile: AsmCmpFile
): Promise<number[]> {
  const compiledFile = await getFile(dirHandler, asmFile.path);
  const idealReader = asmParse(() => lineReader(compiledFile));
  const actualReader = lineReader(await getFile(dirHandler, asmFile.compare));
  const lines: number[] = [];
  let line = 0;
  for await (const areEqual of simpleLineCompare(idealReader, actualReader)) {
    line++;
    if (!areEqual) lines.push(line);
  }
  return lines;
}

/**
 * Check if the output of the assembler with the expected output is the same
 * @param dirHandler the directory handle
 * @param asmFile the asm file to compile and compare
 * @returns the first line that is different
 */
export async function compareAsmFile(
  dirHandler: FileSystemDirectoryHandle,
  asmFile: AsmCmpFile
): Promise<number> {
  const compiledFile = await getFile(dirHandler, asmFile.path);
  const idealReader = asmParse(() => lineReader(compiledFile));
  const actualReader = lineReader(await getFile(dirHandler, asmFile.path));
  let line = 0;
  for await (const areEqual of simpleLineCompare(idealReader, actualReader)) {
    line++;
    if (!areEqual) return line;
  }
  return -1;
}
