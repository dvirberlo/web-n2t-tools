export async function* zip<T>(
  generators: AsyncGenerator<T, void, unknown>[],
  strict: boolean = true,
  fill: T | undefined = undefined
): AsyncGenerator<T[], void, unknown> {
  const buffers = new Array(generators.length);
  let allDone = false;
  while (!allDone) {
    allDone = true;
    for (let i = 0; i < generators.length; i++) {
      const generator = generators[i];
      const { done, value } = await generator.next();
      if (done) {
        if (strict) {
          return;
        }
      } else {
        buffers[i] = value;
        allDone = false;
      }
    }
    if (!allDone) {
      yield buffers;
      buffers.fill(fill);
    }
  }
}
