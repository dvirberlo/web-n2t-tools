import { Outlet, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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
import MenuIcon from '@mui/icons-material/MenuRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import InfoIcon from '@mui/icons-material/InfoRounded';

import './App.css';
import React from 'react';

import { FileService } from './services/file-service';

const theme = createTheme({
  palette: {
    mode: 'dark',
    // primary: {
    //   main: '#f92672',
    // },
    // secondary: {
    //   main: '#66d9ef',
    // },
    // background: {
    //   default: '#272822',
    //   paper: '#272822',
    // },
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
    icon: <InfoIcon />,
  },
  {
    label: 'ASM Comparer',
    path: '/asm-comparer',
    icon: <InfoIcon />,
  },
  // {
  //   label: 'About',
  //   path: '/about',
  //   icon: <InfoIcon />,
  // },
];

export default function App() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return (
    <ThemeProvider theme={theme}>
      <Paper
        elevation={0}
        style={{
          minHeight: '100vh',
          minWidth: '100vw',
          padding: 0,
          margin: 0,
          borderRadius: 0,
        }}
      >
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
                    {/* <ListItemIcon>{item.icon}</ListItemIcon> */}
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
