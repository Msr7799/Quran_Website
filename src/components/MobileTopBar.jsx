import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Fullscreen, FullscreenExit, Home, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useRouter } from 'next/router';

const MobileTopBar = ({
  isFullscreen,
  onToggleFullscreen,
  currentPage,
  totalPages = 604
}) => {
  const router = useRouter();

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      router.push(`/quran-pages/${newPage}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      router.push(`/quran-pages/${newPage}`);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '40px',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: { xs: 'flex', md: 'none' }, // يظهر فقط في الشاشات الصغيرة
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        zIndex: 1100
      }}
    >
      {/* الجانب الأيسر - التنقل */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={handleGoHome}
          size="small"
          sx={{
            color: 'tomato',
            bgcolor: 'rgba(255, 99, 71, 0.1)',
            border: '1px solid rgba(255, 99, 71, 0.3)',
            borderRadius: '6px',
            width: 28,
            height: 28
          }}
        >
          <Home sx={{ fontSize: 14 }} />
        </IconButton>

        <IconButton
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
          size="small"
          sx={{
            color: 'tomato',
            border: '1px solid rgba(255, 99, 71, 0.3)',
            borderRadius: '6px',
            width: 28,
            height: 28,
            '&:disabled': {
              color: 'rgba(255, 99, 71, 0.3)',
              borderColor: 'rgba(255, 99, 71, 0.2)'
            }
          }}
          >
                      <ArrowForward sx={{ fontSize: 14 }} />
        </IconButton>

        <IconButton
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          size="small"
          sx={{
            color: 'tomato',
            border: '1px solid rgba(255, 99, 71, 0.3)',
            borderRadius: '6px',
            width: 28,
            height: 28,
            '&:disabled': {
              color: 'rgba(255, 99, 71, 0.3)',
              borderColor: 'rgba(255, 99, 71, 0.2)'
            }
          }}
        >
          <ArrowBack sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      {/* الوسط - رقم الصفحة */}
      <Typography
        variant="body2"
        sx={{
          color: '#333',
          fontWeight: 600,
          bgcolor: 'rgba(255, 99, 71, 0.1)',
          px: 2,
          py: 0.5,
          borderRadius: '12px',
          border: '1px solid rgba(255, 99, 71, 0.2)'
        }}
      >
        صفحة {currentPage} من {totalPages}
      </Typography>

      {/* الجانب الأيمن - الشاشة الكاملة */}
      <IconButton
        onClick={onToggleFullscreen}
        size="small"
        sx={{
          color: 'tomato',
          bgcolor: 'rgba(255, 99, 71, 0.1)',
          border: '1px solid rgba(255, 99, 71, 0.3)',
          borderRadius: '6px',
          width: 28,
          height: 28
        }}
      >
        {isFullscreen ? (
          <FullscreenExit sx={{ fontSize: 14 }} />
        ) : (
          <Fullscreen sx={{ fontSize: 14 }} />
        )}
      </IconButton>
    </Box>
  );
};

export default MobileTopBar;
