import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const Layout = ({ children }) => {
  const theme = useTheme();
  
  // Media queries للاستجابة
  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1024px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');
  
  // تحديد معامل التحجيم حسب حجم الشاشة
  const getScale = () => {
    if (isSmallMobile) return 0.65;
    if (isMobile) return 0.62;
    if (isTablet) return 0.60;
    return 0.67;
  };
  
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
        // تطبيق لون الخلفية حسب الثيم
        backgroundColor: theme.palette.background.default,
        // التأكد من أن الخلفية تملأ كامل الشاشة
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.background.default,
          zIndex: -1,
        }
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
          paddingRight: '0',
          transform: `scale(${getScale()})`, // التحجيم المتجاوب
          transformOrigin: 'top center',
          // إضافة خلفية للمحتوى المصغر
          backgroundColor: theme.palette.background.default,
          // تحسينات للأجهزة المحمولة
          transition: 'transform 0.3s ease',
          '@media (max-width: 768px)': {
            paddingTop: '10px',
          },
          '@media (max-width: 480px)': {
            paddingTop: '5px',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default React.memo(Layout);
