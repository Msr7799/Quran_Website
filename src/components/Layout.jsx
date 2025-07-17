import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const Layout = ({ children }) => {
  const theme = useTheme();
  
  return (
    <Box
      component="div"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflowX: 'hidden',
        margin: 0,
        padding: 0,
        backgroundColor: theme.palette.background.default,
        // إزالة التحجيم المشكِل
        transform: 'none !important',
        scale: '1 !important',
        zoom: '1 !important',
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          position: 'relative',
          margin: 0,
          padding: 0,
          paddingRight: {
            xs: '60px', // موبايل
            sm: '70px', // تابلت صغير
            md: '80px', // تابلت وأكبر
          },
          backgroundColor: theme.palette.background.default,
          transition: 'padding-right 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default React.memo(Layout);
