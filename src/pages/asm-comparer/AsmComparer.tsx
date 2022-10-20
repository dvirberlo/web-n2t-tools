import { lineReader, getFile } from "../../backend/file-lines-reader";
function AsmComparer() {
  return (
    <div>
      <p>AsmComparer</p>
      <button
        onClick={async () => {
          const dirHandler: FileSystemDirectoryHandle = await (
            window as any
          )?.showDirectoryPicker();
          const file: File = await getFile(dirHandler, "./extensions.json");
          const lines = await lineReader(file);
          for await (const line of lines) {
            console.log(line);
          }
        }}
      >
        Send message
      </button>
    </div>
  );
}

export default AsmComparer;
