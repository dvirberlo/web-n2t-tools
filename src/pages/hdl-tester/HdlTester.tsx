import OutputIcon from '@mui/icons-material/OutputRounded';
import {
  Button,
  Container,
  FormControl,
  MenuItem,
  Typography,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import React, { useState } from 'react';
import { HDL_PROJECTS } from '../../backend/hdl/hdl-files';
import { hdlTest } from '../../backend/hdl/hdl-tester';
import AccordionComponent from '../../components/accordion-component/AccordionComponent';
import AppBarComponent from '../../components/app-bar-component/AppBarComponent';

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
      <AppBarComponent title="HDL Tester">
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <FormControl variant="outlined">
            <TextField
              select
              id="project-select"
              value={selectProject}
              onChange={projectChanged}
              // label="Project"
            >
              {HDL_PROJECTS.map((project, index) => (
                <MenuItem key={index} value={index}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>

          <FormControl variant="outlined" sx={{ marginLeft: '10px' }}>
            <TextField
              select
              id="file-select"
              value={selectedFile}
              onChange={fileChanged}
              // label="File"
            >
              {HDL_PROJECTS[selectProject].files.map((file, index) => (
                <MenuItem key={index} value={index}>
                  {file.name}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>

          <Button onClick={hdlTestClick(selectProject, selectedFile)}>
            Test Chip
          </Button>
        </div>
      </AppBarComponent>

      <Container
        style={{
          paddingInline: '3px',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start',
          marginTop: '2px',
        }}
      >
        <AccordionComponent
          title="Test Results"
          defaultExpanded={true}
          icon={<OutputIcon />}
        >
          {' '}
          <Typography id="test-results" style={{ whiteSpace: 'pre-wrap' }}>
            Click 'Test Chip' to see the results
          </Typography>
        </AccordionComponent>

        <AccordionComponent
          title="Expected Test Results"
          defaultExpanded={true}
          icon={<OutputIcon />}
        >
          {' '}
          <Typography
            id="expected-test-results"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            Click 'Test Chip' to see the output
          </Typography>
        </AccordionComponent>

        <AccordionComponent
          title="Test Instructions"
          defaultExpanded={true}
          icon={<OutputIcon />}
        >
          {' '}
          <Typography id="test-instructions" style={{ whiteSpace: 'pre-wrap' }}>
            Click 'Test Chip' to see the results
          </Typography>
        </AccordionComponent>
      </Container>
    </>
  );
}
function hdlTestClick(
  selectProject: number,
  selectedFile: number
): React.MouseEventHandler<HTMLButtonElement> | undefined {
  return async () => {
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
    const testElem = window.document.querySelector('#test-instructions');
    const expectedElem = window.document.querySelector(
      '#expected-test-results'
    );
    const resultsElem = window.document.querySelector('#test-results');
    if (!(testElem && expectedElem && resultsElem))
      throw new Error('Output elements not found');
    testElem.textContent = JSON.stringify(input, null, 2);
    console.log(HDL_PROJECTS[selectProject].files[selectedFile]);
    hdlTest(HDL_PROJECTS[selectProject].files[selectedFile], input)
      .then((result) => {
        for (const key in result)
          console.log(result[key].toString(2).padStart(16, '0'), key);
        console.log('output', result);
        resultsElem.textContent = JSON.stringify(result, null, 2);
      })
      .catch((err) => {
        console.log(`hdlTest error:\n${err}`);
      });
  };
}
