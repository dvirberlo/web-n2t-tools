import BoltIcon from '@mui/icons-material/BoltRounded';
import OutputIcon from '@mui/icons-material/OutputRounded';
import AsmIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import {
  Button,
  Container,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { ASM_CMP_FILES } from '../../backend/asm/asm-cmp-files';
import { fullCompareAsmFile } from '../../backend/asm/asm-comparer';
import AccordionComponent from '../../components/accordion-component/AccordionComponent';
import AppBarComponent from '../../components/app-bar-component/AppBarComponent';

const parseClick = async (asmFile: number) => {
  const wrongLines = fullCompareAsmFile(ASM_CMP_FILES[asmFile]);
  const outputElem = window.document.querySelector('#output');
  const expectedOutputElem = window.document.querySelector('#expected-output');
  const asmOutputElem = window.document.querySelector('#asm-output');
  if (!outputElem || !expectedOutputElem || !asmOutputElem)
    throw new Error('Output elements not found');

  [outputElem, expectedOutputElem, asmOutputElem].forEach(
    (elem) => (elem.textContent = '')
  );
  let correct = true;
  for await (const result of await wrongLines) {
    correct = false;
    outputElem.textContent +=
      `line ${result.line}: ` + result.actualLine + '\n';
    expectedOutputElem.textContent +=
      `line ${result.line}: ` + result.idealLine + '\n';
    asmOutputElem.textContent +=
      `line ${result.line}: ` + result.asmLine + '\n';
  }
  if (correct) {
    [outputElem, expectedOutputElem, asmOutputElem].forEach(
      (elem) => (elem.textContent = 'All lines are correct!\n')
    );
  }
};
export default function AsmComparer() {
  const [asmFile, setAsmFile] = React.useState<number>(0);
  return (
    <>
      <AppBarComponent title="Assembly Comparer">
        <div style={{ display: 'flex', flexDirection: 'row' }}>
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
          <Button startIcon={<BoltIcon />} onClick={() => parseClick(asmFile)}>
            Compare ASM
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
          title="Output"
          defaultExpanded={true}
          icon={<OutputIcon />}
        >
          {' '}
          <Typography id="output" style={{ whiteSpace: 'pre-wrap' }}>
            Click 'Compare ASM' to see the output
          </Typography>
        </AccordionComponent>

        <AccordionComponent
          title="Expected Output"
          defaultExpanded={true}
          icon={<OutputIcon />}
        >
          {' '}
          <Typography id="expected-output" style={{ whiteSpace: 'pre-wrap' }}>
            Click 'Compare ASM' to see the output
          </Typography>
        </AccordionComponent>

        <AccordionComponent
          title="Assembly Output"
          defaultExpanded={true}
          icon={<AsmIcon />}
        >
          {' '}
          <Typography id="asm-output" style={{ whiteSpace: 'pre-wrap' }}>
            Click 'Compare ASM' to see the output
          </Typography>
        </AccordionComponent>
      </Container>
    </>
  );
}
