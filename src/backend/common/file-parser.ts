export class CommentsDumper {
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

  public dumps(lines: string): string {
    return lines
      .split('\n')
      .map((line) => this.dump(line))
      .join('\n');
  }
}

export async function gatherUntil(
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

export async function tryFile<T>(
  path: string,
  func: (path: string, dir?: FileSystemDirectoryHandle) => Promise<T>,
  dir?: FileSystemDirectoryHandle
): Promise<T> {
  try {
    return await func(path, dir);
  } catch (e) {
    throw `Could not read test file: ${path}`;
  }
}
