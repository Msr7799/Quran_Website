// src/components/QuranLoader.jsx - مكون التحميل الخاص بموقع القرآن الكريم

import React from 'react';
import { Box, Typography } from '@mui/material';

const QuranLoader = ({ 
  text = "جاري التحميل...", 
  size = 64, 
  showText = true,
  fullScreen = false,
  className = ""
}) => {
  const loaderContent = (
    <Box
      className={`quran-loader ${className}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(184deg, rgba(134, 134, 134, 0.49), rgba(39, 39, 39, 0.88))',
          backdropFilter: 'blur(10px)',
          zIndex: 9999
        })
      }}
    >
      {/* مكون الـ Loader */}
      <Box
        sx={{
          '--front-color': '#1976d2',
          '--back-color': '#C3C8DE',
          '--text-color': '#414856',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          
          '& svg': {
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            
            '& circle': {
              position: 'absolute',
              fill: 'none',
              strokeWidth: 6,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              transform: 'rotate(-100deg)',
              transformOrigin: 'center',
              
              '&.back': {
                stroke: 'var(--back-color)'
              },
              '&.front': {
                stroke: 'var(--front-color)'
              }
            }
          },
          
          '& .circle-outer': {
            height: '86px',
            width: '86px',
            
            '& circle': {
              strokeDasharray: '62.75 188.25',
              
              '&.back': {
                animation: 'circle-outer 1.8s ease infinite 0.3s'
              },
              '&.front': {
                animation: 'circle-outer 1.8s ease infinite 0.15s'
              }
            }
          },
          
          '& .circle-middle': {
            height: '60px',
            width: '60px',
            
            '& circle': {
              strokeDasharray: '42.5 127.5',
              
              '&.back': {
                animation: 'circle-middle 1.8s ease infinite 0.25s'
              },
              '&.front': {
                animation: 'circle-middle 1.8s ease infinite 0.1s'
              }
            }
          },
          
          '& .circle-inner': {
            height: '34px',
            width: '34px',
            
            '& circle': {
              strokeDasharray: '22 66',
              
              '&.back': {
                animation: 'circle-inner 1.8s ease infinite 0.2s'
              },
              '&.front': {
                animation: 'circle-inner 1.8s ease infinite 0.05s'
              }
            }
          },
          
          '@keyframes circle-outer': {
            '0%': { strokeDashoffset: 25 },
            '25%': { strokeDashoffset: 0 },
            '65%': { strokeDashoffset: 301 },
            '80%': { strokeDashoffset: 276 },
            '100%': { strokeDashoffset: 276 }
          },
          
          '@keyframes circle-middle': {
            '0%': { strokeDashoffset: 17 },
            '25%': { strokeDashoffset: 0 },
            '65%': { strokeDashoffset: 204 },
            '80%': { strokeDashoffset: 187 },
            '100%': { strokeDashoffset: 187 }
          },
          
          '@keyframes circle-inner': {
            '0%': { strokeDashoffset: 9 },
            '25%': { strokeDashoffset: 0 },
            '65%': { strokeDashoffset: 106 },
            '80%': { strokeDashoffset: 97 },
            '100%': { strokeDashoffset: 97 }
          }
        }}
      >
        {/* الدوائر الخارجية */}
        <svg className="circle-outer" viewBox="0 0 86 86">
          <circle className="back" cx="43" cy="43" r="40"></circle>
          <circle className="front" cx="43" cy="43" r="40"></circle>
        </svg>
        
        {/* الدوائر الوسطى */}
        <svg className="circle-middle" viewBox="0 0 60 60">
          <circle className="back" cx="30" cy="30" r="27"></circle>
          <circle className="front" cx="30" cy="30" r="27"></circle>
        </svg>
        
        {/* الدوائر الداخلية */}
        <svg className="circle-inner" viewBox="0 0 34 34">
          <circle className="back" cx="17" cy="17" r="14"></circle>
          <circle className="front" cx="17" cy="17" r="14"></circle>
        </svg>
        
        {/* رمز الله في الوسط */}
        <Typography
          variant="h4"
          sx={{
            color: '#000040',
            textShadow: '0 0 5px #f4f4f4, 0 0 13px #656565',
            fontSize: `${size * 0.4}px`,
            fontWeight: 700,
            fontFamily: 'var(--font-family-arabic)',
            zIndex: 10000,
            position: 'absolute'
          }}
        >
          ﷲ
        </Typography>
      </Box>
      
      {/* النص */}
      {showText && (
        <Typography
          variant="body1"
          sx={{
            color: '#414856',
            fontFamily: 'var(--font-family-arabic)',
            fontSize: '16px',
            fontWeight: 500,
            textAlign: 'center',
            animation: 'text-fade 2s ease-in-out infinite',
            
            '@keyframes text-fade': {
              '0%': { opacity: 0.5 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.5 }
            }
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );

  return loaderContent;
};

export default QuranLoader;
