import { getDir } from '../../backend/files/files';
import { hdlTest } from '../../backend/hdl/hdl-tester';

export default function HdlTester() {
  return (
    <div>
      <p>HdlTester</p>
      <button
        onClick={async () => {
          const dirHandler: FileSystemDirectoryHandle = await (
            window as any
          )?.showDirectoryPicker();
          const input = {
            a: 11,
            b: 12,
            c: 13,
            d: 14,
            e: 15,
            f: 16,
            g: 71,
            h: 18,
            sel: 6,
          };
          console.log('input', input);
          const hdlDir = await getDir(dirHandler, './01');
          hdlTest(hdlDir, 'Mux8Way16', input)
            .then((result) => {
              // for (const key in result)
              //   console.log(result[key].toString(2).padStart(16, '0'), key);
              console.log('output', result);
            })
            .catch((err) => {
              console.log(`hdlTest error:\n${err}`);
            });
        }}
      >
        hdl test 1
      </button>
      <button
        onClick={async () => {
          const dirHandler: FileSystemDirectoryHandle = await (
            window as any
          )?.showDirectoryPicker();
          const input = {
            x: 16,
            y: 55,
            zx: 0,
            nx: 0,
            zy: 0,
            ny: 0,
            f: 1,
            no: 0,
          };
          console.log('input', input);
          const hdlDir = await getDir(dirHandler, './02');
          hdlTest(hdlDir, 'ALU', input)
            .then((result) => {
              // for (const key in result)
              //   console.log(result[key].toString(2).padStart(16, '0'), key);
              console.log('output', result);
            })
            .catch((err) => {
              console.log(`hdlTest error:\n${err}`);
            });
        }}
      >
        hdl test 2
      </button>
    </div>
  );
}
