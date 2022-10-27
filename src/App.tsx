import XmlIcon from '@mui/icons-material/AccountTreeRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
// import VmIcon from '@mui/icons-material/CodeRounded';
// import JackIcon from '@mui/icons-material/DataObjectRounded';
import AsmCompareIcon from '@mui/icons-material/FactCheckRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import InfoIcon from '@mui/icons-material/InfoRounded';
import HdlIcon from '@mui/icons-material/MemoryRounded';
import MenuIcon from '@mui/icons-material/MenuRounded';
import AsmIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import {
  Box,
  Fab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  SwipeableDrawer,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Outlet, useNavigate } from 'react-router-dom';

import React from 'react';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const menuItems: {
  label: string;
  path: string;
  icon: JSX.Element;
}[] = [
  {
    label: 'Home',
    path: '/',
    icon: <HomeIcon />,
  },
  {
    label: 'HDL Tester',
    path: '/hdl-tester',
    icon: <HdlIcon />,
  },
  {
    label: 'ASM Comparer',
    path: '/asm-comparer',
    icon: <AsmCompareIcon />,
  },
  {
    label: 'ASM Tester',
    path: '/asm-tester',
    icon: <AsmIcon />,
  },
  {
    label: 'VM Tree Comparer',
    path: '/vm-xml-comparer',
    icon: <XmlIcon />,
  },
  // {
  //   label: 'VM Tester',
  //   path: '/vm-tester',
  //   icon: <VmIcon />,
  // },
  // {
  //   label: 'Jack Tester',
  //   path: '/jack-tester',
  //   icon: <JackIcon />,
  // },
  {
    label: 'About',
    path: '/about',
    icon: <InfoIcon />,
  },
];

export default function App() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return (
    <ThemeProvider theme={theme}>
      <Paper
        elevation={0}
        style={{
          height: '100vh',
          width: '100vw',
          padding: 0,
          margin: 0,
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowY: 'auto', height: '100vh' }}>
          <SwipeableDrawer
            sx={{
              zIndex: 100,
            }}
            anchor="left"
            open={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onOpen={() => setIsMenuOpen(true)}
          >
            <Box
              sx={{
                width: 250,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <List>
                {menuItems.map((item) => (
                  <ListItem
                    key={item.label}
                    disablePadding
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(item.path);
                    }}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                      },
                    }}
                  >
                    <ListItemButton>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </SwipeableDrawer>
          <MenuFloatingButton
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
          <Outlet />
        </div>
      </Paper>
    </ThemeProvider>
  );
}

function MenuFloatingButton({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 101,
        padding: 1,
      }}
    >
      <Fab
        color="secondary"
        aria-label="menu"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </Fab>
    </Box>
  );
}
