import { CommentsDumper, tryFile } from '../common/file-parser';
import { FileService } from '../../services/file-service';
import { HdlFile } from './hdl-files';
import { HdlIO, HdlRunner } from './hdl-runner';
import { FormatType, OutputFormat, parseHeader } from '../common/test-parser';

export async function testFile(testPath: string): Promise<{
  output: string;
  expected: string;
  instructions: string;
  wrongLines: number[];
}> {
  const commentsDumper = new CommentsDumper();
  const [testDir, testFile] = await tryFile(
    testPath,
    FileService.getDirAndFile
  );
  const testFileText = await testFile.text();
  const instructions = commentsDumper
    .dumps(testFileText)
    .split(';')
    .map((s) => s.trim());
  const [chipPath, outputPath, expectedPath, outputFormat] = parseHeader(
    instructions.shift() || ''
  );

  const output: string = await runTest(
    instructions,
    chipPath,
    testDir,
    outputFormat
  );

  const expectedFileText = await tryFile(
    expectedPath,
    FileService.getText,
    testDir
  );
  const wrongLines: number[] = compareOutput(output, expectedFileText);
  return {
    output: output,
    expected: expectedFileText,
    instructions: testFileText,
    wrongLines,
  };
}

async function runTest(
  instructionsR: string[],
  chipPath: string,
  testDir: FileSystemDirectoryHandle,
  outputFormat: OutputFormat
): Promise<string> {
  const runner = await HdlRunner.create(chipPath, testDir);
  for (let instructions of instructionsR) {
    for (let instruct of instructions.split(',').map((s) => s.trim())) {
      // split by any number of spaces or new lines
      const [command, ...args] = instruct.split(/\s+/);
      switch (command) {
        case 'set':
          const [name, setter] = args;
          const isBin =
            (setter.slice(0, 2) as FormatType) === '%' + FormatType.BINARY;
          const value = parseInt(setter.slice(isBin ? 2 : 0), isBin ? 2 : 10);
          runner.input[name] = value;
          break;
        case 'eval':
          await runner.eval();
          break;
        case 'output':
          break;
        // case 'tick':
        //   HdlRunner.tick();
        //   break;
        // case 'tock':
        //   HdlRunner.tock();
        //   break;
      }
    }
  }
  return formatOutput(runner.output, outputFormat);
}

function formatOutput(outputs: HdlIO[], format: OutputFormat) {
  let outputText = '|';
  for (let frmt of format) {
    const spaces =
      frmt.width + frmt.spacesAfter + frmt.spacesBefore - frmt.name.length;
    outputText +=
      ' '.repeat(spaces / 2) +
      frmt.name +
      ' '.repeat(spaces / 2 + (spaces % 2)) +
      '|';
  }
  outputText += '\n';
  for (const output of outputs) {
    for (const frmt of format) {
      const value = output[frmt.name];
      const val =
        frmt.type === FormatType.BINARY
          ? value.toString(2).padStart(frmt.width, '0')
          : value.toString().padStart(frmt.width, ' ');
      outputText +=
        '|' +
        ' '.repeat(frmt.spacesBefore) +
        val +
        ' '.repeat(frmt.spacesAfter);
    }
    outputText += '|\n';
  }
  return outputText;
}

function compareOutput(output: string, expected: string): number[] {
  const outputLines = output.split('\n');
  const expectedLines = expected.split('\n');
  let wrongLines: number[] = [];
  for (let i = 0; i < expectedLines.length; i++) {
    if (outputLines[i].trim() !== expectedLines[i].trim()) wrongLines.push(i);
  }
  return wrongLines;
}
