// src/components/LoadingSpinner.jsx - مكون تحميل صغير للعناصر الفردية

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import QuranLoader from './QuranLoader';

const LoadingSpinner = ({ 
  type = "quran", // quran, simple, dots
  size = 40,
  text = "",
  color = "primary",
  overlay = false,
  className = ""
}) => {
  const renderLoader = () => {
    switch (type) {
      case 'quran':
        return (
          <QuranLoader 
            size={size} 
            text={text} 
            showText={!!text}
            className={className}
          />
        );
      
      case 'simple':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={size} color={color} />
            {text && (
              <Typography variant="caption" color="text.secondary">
                {text}
              </Typography>
            )}
          </Box>
        );
      
      case 'dots':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                '& .dot': {
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  animation: 'dot-bounce 1.4s ease-in-out infinite both',
                  '&:nth-of-type(1)': { animationDelay: '-0.32s' },
                  '&:nth-of-type(2)': { animationDelay: '-0.16s' },
                },
                '@keyframes dot-bounce': {
                  '0%, 80%, 100%': {
                    transform: 'scale(0)',
                  },
                  '40%': {
                    transform: 'scale(1)',
                  },
                }
              }}
            >
              <Box className="dot" />
              <Box className="dot" />
              <Box className="dot" />
            </Box>
            {text && (
              <Typography variant="caption" color="text.secondary">
                {text}
              </Typography>
            )}
          </Box>
        );
      
      default:
        return <CircularProgress size={size} color={color} />;
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        ...(overlay && {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000
        })
      }}
    >
      {renderLoader()}
    </Box>
  );

  return content;
};

export default LoadingSpinner;
