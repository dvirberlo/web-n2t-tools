import { AppBar, Toolbar, Typography } from '@mui/material';
import React from 'react';

export default function AppBarComponent(props: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {props.title}
          </Typography>
          {props.children}
        </Toolbar>
      </AppBar>
    </>
  );
}
