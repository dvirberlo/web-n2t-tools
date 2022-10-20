export function simpleLineComparer(a: string, b: string): number {
  return a.localeCompare(b);
}

/**
 *
 * @param dirHandle The directory to read
 * @param path The **relative** path to the file
 * @returns A promise that resolves to the desired file
 */
export async function getFile(
  dirHandle: FileSystemDirectoryHandle,
  path: string
): Promise<File> {
  const parts = path.split("/");
  if (parts[0] == ".") parts.shift();
  const filename = parts.pop();
  let fileHandle = dirHandle;
  for (const part of parts) {
    fileHandle = await fileHandle.getDirectoryHandle(part);
  }
  return (await fileHandle.getFileHandle(filename || "")).getFile();
}

export async function* lineReader(
  file: File
): AsyncGenerator<string, void, unknown> {
  const reader = file.stream().getReader();
  let decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      yield line;
    }
  }
  if (buffer.length > 0) {
    yield buffer;
  }
}
