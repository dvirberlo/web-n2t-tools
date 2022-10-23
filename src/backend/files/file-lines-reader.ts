/**
 * Buffers a file and yields lines from it.
 * @param file The file to read
 * @returns A generator that yields lines from the file
 */
export async function* lineReader(
  file: File
): AsyncGenerator<string, void, unknown> {
  const reader = file.stream().getReader();
  let decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      yield line;
    }
  }
  if (buffer.length > 0) {
    yield buffer;
  }
}
