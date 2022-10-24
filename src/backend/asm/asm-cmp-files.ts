export type AsmCmpFile = {
  name: string;
  path: string;
  compare: string;
};
export const ASM_CMP_FILES: AsmCmpFile[] = [
  {
    name: 'Add',
    path: './06/add/Add.asm',
    compare: './06/add/Add.hack',
  },
  {
    name: 'Max',
    path: './06/max/Max.asm',
    compare: './06/max/Max.hack',
  },
  {
    name: 'RectL',
    path: './06/rect/RectL.asm',
    compare: './06/rect/RectL.hack',
  },
  {
    name: 'Rect',
    path: './06/rect/Rect.asm',
    compare: './06/rect/Rect.hack',
  },
  {
    name: 'PongL',
    path: './06/pong/PongL.asm',
    compare: './06/pong/PongL.hack',
  },
  {
    name: 'Pong',
    path: './06/pong/Pong.asm',
    compare: './06/pong/Pong.hack',
  },
];
