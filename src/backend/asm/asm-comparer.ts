import { simpleLineCompare } from '../compare';
import { AsmCmpFile } from './asm-cmp-files';
import { asmParse } from './assembler';
import { FileService } from '../../services/file-service';

/**
 * Compares the output of the assembler with the expected output
 * @param dirHandler the directory handler
 * @param asmFile the asm file to compile and compare
 * @returns array of lines that are different
 */
export async function fullCompareAsmFile(
  asmFile: AsmCmpFile
): Promise<number[]> {
  const idealReader = asmParse(() => FileService.getLineReader(asmFile.path));
  const actualReader = FileService.getLineReader(asmFile.compare);
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
export async function compareAsmFile(asmFile: AsmCmpFile): Promise<number> {
  const idealReader = asmParse(() => FileService.getLineReader(asmFile.path));
  const actualReader = FileService.getLineReader(asmFile.compare);
  let line = 0;
  for await (const areEqual of simpleLineCompare(idealReader, actualReader)) {
    line++;
    if (!areEqual) return line;
  }
  return -1;
}
