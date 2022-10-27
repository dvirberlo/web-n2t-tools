// type FormatType = 'B' | 'D' | 'S';
export enum FormatType {
  BINARY = 'B',
  DECIMAL = 'D',
  STRING = 'S',
}

export type OutputFormat = {
  name: string;
  type: FormatType;
  width: number;
  spacesBefore: number;
  spacesAfter: number;
  index: number | undefined;
}[];

export function parseHeader(
  header: string
): [string, string, string, OutputFormat] {
  let outputFormat: OutputFormat = [];
  let [chipPath, outputPath, expectedPath] = ['', '', ''];
  let sections = header.split(',').map((s) => s.trim());
  for (let section of sections) {
    const [key, ...values] = section.split(' ');
    const value = values.join(' ');
    switch (key) {
      case 'load':
        chipPath = value.trim();
        break;
      case 'output-file':
        outputPath = value.trim();
        break;
      case 'compare-to':
        expectedPath = value.trim();
        break;
      case 'output-list':
        // split by any number of spaces or new lines
        for (let output of value.split(/\s+/)) {
          let [name, format] = output.split('%').map((s) => s.trim());
          const index = name.includes('[')
            ? parseInt(name.split('[')[1].trim().slice(0, -1))
            : undefined;
          let type = format[0] as FormatType;
          let [spacesBefore, width, spacesAfter] = format
            .slice(1)
            .split('.')
            .map((s) => parseInt(s));
          outputFormat.push({
            name,
            type,
            width,
            spacesBefore,
            spacesAfter,
            index,
          });
        }
        break;
    }
  }
  if (!chipPath || !outputPath || !expectedPath) {
    throw `Test file header is invalid: ${header}`;
  }
  return [chipPath, outputPath, expectedPath, outputFormat];
}
