import { asmParse } from '../../backend/asm/assembler';
import { lineReader } from '../../backend/files/file-lines-reader';
import { getFile } from '../../backend/files/files';

export default function AsmComparer() {
  return (
    <div>
      <p>AsmComparer</p>
      <button
        onClick={async () => {
          const dirHandler: FileSystemDirectoryHandle = await (
            window as any
          )?.showDirectoryPicker();
          const file: File = await getFile(dirHandler, './06/pong/Pong.asm');
          const arr = [];
          for await (const line of asmParse(() => lineReader(file))) {
            arr.push(line);
          }
          console.log(arr.join('\n'));
        }}
      >
        asm parse
      </button>
    </div>
  );
}
