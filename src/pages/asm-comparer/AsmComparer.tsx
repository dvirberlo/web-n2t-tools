import BoltIcon from '@mui/icons-material/BoltRounded';
import {
  AppBar,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { fullCompareAsmFile } from '../../backend/asm/asm-comparer';
import { ASM_CMP_FILES } from '../../backend/asm/asm-cmp-files';

export default function AsmComparer() {
  const [asmFile, setAsmFile] = React.useState<number>(0);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={{ flexGrow: 1 }}>AsmComparer</Typography>
          {/* a box at the right side of the app bar */}
          <Box gridColumn={1}>
            <TextField
              select
              value={asmFile}
              onChange={(e) => setAsmFile(parseInt(e.target.value))}
            >
              {ASM_CMP_FILES.map((asmFile, index) => (
                <MenuItem key={index} value={index}>
                  {asmFile.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box gridColumn={1}>
            <Button
              startIcon={<BoltIcon />}
              onClick={async () => {
                const dirHandler: FileSystemDirectoryHandle = await (
                  window as any
                )?.showDirectoryPicker();
                const wrongLines = await fullCompareAsmFile(
                  dirHandler,
                  ASM_CMP_FILES[asmFile]
                );
                console.log('wrongs lines', wrongLines);
              }}
            >
              asm parse
            </Button>
          </Box>
        </Grid>
      </AppBar>
    </Box>
  );
}
