import { FileService } from '../../services/file-service';
import { zip2 } from '../common';
import { simpleLineCompare } from '../compare';
import { AsmCmpFile } from './asm-cmp-files';
import { asmParse } from './assembler';

/**
 * Compares the output of the assembler with the expected output
 * @param dirHandler the directory handler
 * @param asmFile the asm file to compile and compare
 * @returns array of lines that are different
 */
export async function* fullCompareAsmFile(
  asmFile: AsmCmpFile
): AsyncGenerator<AsmCompareResult, void, unknown> {
  const idealReader = asmParse(() => FileService.getLineReader(asmFile.path));
  const actualReader = FileService.getLineReader(asmFile.compare);
  let line = 0;
  for await (let [[asmLine, idealLine], actualLine] of zip2<
    [string, string],
    string
  >([idealReader, actualReader])) {
    line++;
    [asmLine, idealLine, actualLine] = [asmLine, idealLine, actualLine].map(
      (l) => l.trim()
    );
    if (idealLine !== actualLine)
      yield { line, idealLine, actualLine, asmLine };
  }
}

export type AsmCompareResult = {
  line: number;
  idealLine: string;
  actualLine: string;
  asmLine: string;
};
