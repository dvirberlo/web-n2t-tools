/**
 * Creates a file object from a file handle and a path.
 * @param dirHandle The directory to read
 * @param path The **relative** path to the file
 * @returns A promise that resolves to the desired file
 */
export async function getFile(
  dirHandle: FileSystemDirectoryHandle,
  path: string
): Promise<File> {
  const parts = path.split('/');
  const filename = parts.pop();
  const dir = await getDir(dirHandle, parts.join('/'));
  return await (await dir.getFileHandle(filename || '')).getFile();
}

/**
 * Creates a directory object from a file handle and a path.
 * @param dirHandle The directory to read
 * @param path The **relative** path to the file
 * @returns A promise that resolves to the desired file
 */
export async function getDir(
  dirHandle: FileSystemDirectoryHandle,
  path: string
): Promise<FileSystemDirectoryHandle> {
  const parts = path.split('/');
  if (parts[0] === '.' || parts[0] === '') parts.shift();
  let fileHandle = dirHandle;
  for (const part of parts) {
    fileHandle = await fileHandle.getDirectoryHandle(part);
  }
  return fileHandle;
}

/**
 * Creates a file object and its parent directory by a dirHandle and a path.
 * @param dirHandle The directory to read
 * @param path The **relative** path to the file
 * @returns A promise that resolves to the desired file and its parent directory
 */
export async function getFileAndDir(
  dirHandle: FileSystemDirectoryHandle,
  path: string
): Promise<[File, FileSystemDirectoryHandle]> {
  const parts = path.split('/');
  const filename = parts.pop();
  const dir = await getDir(dirHandle, parts.join('/'));
  return [await (await dir.getFileHandle(filename || '')).getFile(), dir];
}
