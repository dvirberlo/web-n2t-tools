import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';

export default function AccordionComponent(props: {
  children?: React.ReactNode;
  title?: string;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  id?: string;
}) {
  return (
    <Accordion
      defaultExpanded={props.defaultExpanded}
      disableGutters
      sx={{
        flexGrow: 1,
        minWidth: '350px',
        maxWidth: '98%',
        width: '49%',
        margin: '2px',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {props.icon}
        <Typography sx={{ marginLeft: '10px' }}>{props.title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{props.children}</AccordionDetails>
    </Accordion>
  );
}
