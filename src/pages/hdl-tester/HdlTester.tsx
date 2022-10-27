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
import { HdlRunner } from '../../backend/hdl/hdl-runner';
import AccordionComponent from '../../components/accordion-component/AccordionComponent';
import AppBarComponent from '../../components/app-bar-component/AppBarComponent';

import { testFile } from '../../backend/hdl/hdl-tester';

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

          <Button onClick={() => hdlTestClick(selectProject, selectedFile)}>
            Test Chip
          </Button>
        </div>
      </AppBarComponent>

      <Container
        maxWidth="xl"
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
          <OutputText
            id="test-results"
            text={"Click 'Test Chip' to see the results"}
          />
        </AccordionComponent>

        <AccordionComponent
          title="Expected Test Results"
          defaultExpanded={true}
          icon={<OutputIcon />}
        >
          <OutputText
            id="expected-test-results"
            text={"Click 'Test Chip' to see the results"}
          />
        </AccordionComponent>

        <AccordionComponent
          title="Test Instructions"
          defaultExpanded={false}
          icon={<OutputIcon />}
        >
          <OutputText
            id="test-instructions"
            text={"Click 'Test Chip' to see the results"}
          />
        </AccordionComponent>
      </Container>
    </>
  );
}
async function hdlTestClick(
  selectProject: number,
  selectedFile: number
): Promise<void> {
  testFile(HDL_PROJECTS[selectProject].files[selectedFile].testPath).then(
    (result) => {
      console.log(result);
      const testElem = window.document.querySelector('#test-instructions');
      const expectedElem = window.document.querySelector(
        '#expected-test-results'
      );
      const resultsElem = window.document.querySelector('#test-results');
      if (!(testElem && expectedElem && resultsElem))
        throw new Error('Output elements not found');
      testElem.innerHTML = result.instructions;
      expectedElem.innerHTML = result.expected;
      resultsElem.innerHTML = result.output;
    }
  );
}

function OutputText(props: { id: string; text: string }) {
  return (
    <pre id={props.id} style={{ whiteSpace: 'break-spaces' }}>
      {props.text}
    </pre>
  );
}
