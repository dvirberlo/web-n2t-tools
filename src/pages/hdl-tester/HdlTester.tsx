import {
  AppBar,
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Typography,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import { HDL_PROJECTS } from '../../backend/hdl/hdl-files';
import { hdlTest } from '../../backend/hdl/hdl-tester';

export default function HdlTester() {
  const [selectProject, setSelectProject] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const projectChanged = (e: React.ChangeEvent) => {
    setSelectProject(parseInt((e.target as HTMLInputElement).value));
    setSelectedFile(0);
  };
  const fileChanged = (e: React.ChangeEvent) => {
    setSelectedFile(parseInt((e.target as HTMLInputElement).value));
  };
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>HdlTester</Typography>
          </Grid>
        </AppBar>
        <br />
        <FormControl variant="outlined">
          <TextField
            select
            id="project-select"
            value={selectProject}
            onChange={projectChanged}
            label="Project"
          >
            {HDL_PROJECTS.map((project, index) => (
              <MenuItem key={index} value={index}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
        <FormControl variant="outlined">
          <TextField
            select
            id="file-select"
            value={selectedFile}
            onChange={fileChanged}
            label="File"
          >
            {HDL_PROJECTS[selectProject].files.map((file, index) => (
              <MenuItem key={index} value={index}>
                {file.name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>

        <Button
          onClick={async () => {
            const dirHandler: FileSystemDirectoryHandle = await (
              window as any
            )?.showDirectoryPicker();
            const input = {
              in: 5,
              a: 11,
              b: 12,
              c: 13,
              d: 14,
              e: 15,
              f: 1,
              g: 71,
              h: 18,
              sel: 6,
              x: 16,
              y: 55,
              zx: 0,
              nx: 0,
              zy: 0,
              ny: 0,

              no: 0,
            };
            console.log('input', input);
            const output = hdlTest(
              dirHandler,
              HDL_PROJECTS[selectProject].files[selectedFile],
              input
            )
              .then((result) => {
                for (const key in result)
                  console.log(result[key].toString(2).padStart(16, '0'), key);
                console.log('output', result);
              })
              .catch((err) => {
                console.log(`hdlTest error:\n${err}`);
              });
          }}
        >
          Test This HDL
        </Button>
      </Box>
    </>
  );
}
