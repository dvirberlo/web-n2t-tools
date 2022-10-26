export namespace FileService {
  let _fs: FileSystemDirectoryHandle | undefined;
  const fsApiSupported: boolean =
    (window as any).showDirectoryPicker !== undefined;

  async function $fs(): Promise<FileSystemDirectoryHandle> | never {
    if (_fs !== undefined) return _fs;
    _fs = await _requestPermission();
    return _fs;
  }
  async function _requestPermission(): Promise<FileSystemDirectoryHandle> {
    if (!fsApiSupported) {
      window.alert(
        "Your browser doesn't support the FileSystem API.\nPlease use a different browser."
      );
      throw new Error('File System API not supported');
    }
    window.alert(
      "You need to grant permission to access your project directory.\nPlease select the directory named 'projects' in your project directory."
    );
    try {
      return await (window as any).showDirectoryPicker();
    } catch (e) {
      window.alert(
        "You didn't grant permission to access your file system.\nPlease try again."
      );
      throw new Error('File System Permission denied');
    }
  }

  export async function getDir(
    dirPath: string
  ): Promise<FileSystemDirectoryHandle> {
    const parts = dirPath.split('/');
    if (parts[0] === '.' || parts[0] === '') parts.shift();
    let fileHandle = await $fs();
    for (const part of parts) {
      fileHandle = await fileHandle.getDirectoryHandle(part);
    }
    return fileHandle;
  }

  export async function getFileAndDir(
    filePath: string
  ): Promise<[File, FileSystemDirectoryHandle]> {
    const parts = filePath.split('/');
    const filename = parts.pop();
    const dir = await getDir(parts.join('/'));
    return [await (await dir.getFileHandle(filename || '')).getFile(), dir];
  }

  export async function getFile(filePath: string): Promise<File> {
    const [file] = await getFileAndDir(filePath);
    return file;
  }

  export async function* getLineReader(
    filePath: string
  ): AsyncGenerator<string, void, unknown> {
    const file = await getFile(filePath);
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
  export async function* getLineReaderInside(
    filePath: string,
    dir: FileSystemDirectoryHandle
  ): AsyncGenerator<string, void, unknown> {
    const file = await dir.getFileHandle(filePath);
    const reader = (await file.getFile()).stream().getReader();
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
}
