// src/components/PageLoader.jsx - مكون تحميل الصفحات مع الانتقالات الانسيابية

import React, { useState, useEffect } from 'react';
import { Box, Fade, Slide, Zoom } from '@mui/material';
import QuranLoader from './QuranLoader';

const PageLoader = ({ 
  children, 
  isLoading = false, 
  loadingText = "جاري تحميل القرآن الكريم...",
  animationType = "fade", // fade, slide, zoom
  minLoadingTime = 1500,
  staggerChildren = false,
  staggerDelay = 100
}) => {
  const [showContent, setShowContent] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
      setLoadingComplete(false);
    } else {
      // تأخير لضمان الحد الأدنى لوقت التحميل
      const timer = setTimeout(() => {
        setLoadingComplete(true);
        setTimeout(() => setShowContent(true), 100);
      }, minLoadingTime);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingTime]);

  // مكون الانتقال حسب النوع
  const AnimationWrapper = ({ children: animChildren, show }) => {
    switch (animationType) {
      case 'slide':
        return (
          <Slide direction="up" in={show} timeout={800}>
            <Box>{animChildren}</Box>
          </Slide>
        );
      case 'zoom':
        return (
          <Zoom in={show} timeout={600}>
            <Box>{animChildren}</Box>
          </Zoom>
        );
      default: // fade
        return (
          <Fade in={show} timeout={1000}>
            <Box>{animChildren}</Box>
          </Fade>
        );
    }
  };

  // مكون الأطفال مع التأخير التدريجي
  const StaggeredChildren = ({ children: staggerChildren }) => {
    const [visibleChildren, setVisibleChildren] = useState([]);

    useEffect(() => {
      if (showContent && staggerChildren) {
        React.Children.forEach(staggerChildren, (child, index) => {
          setTimeout(() => {
            setVisibleChildren(prev => [...prev, index]);
          }, index * staggerDelay);
        });
      }
    }, [showContent, staggerChildren]);

    if (!staggerChildren) return staggerChildren;

    return React.Children.map(staggerChildren, (child, index) => (
      <Fade 
        key={index} 
        in={visibleChildren.includes(index)} 
        timeout={600}
        style={{ transitionDelay: `${index * 50}ms` }}
      >
        <Box>{child}</Box>
      </Fade>
    ));
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* شاشة التحميل */}
      <Fade in={isLoading || !loadingComplete} timeout={500}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(184deg, rgba(134, 134, 134, 0.49), rgba(39, 39, 39, 0.88))',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isLoading || !loadingComplete ? 1 : 0,
            visibility: isLoading || !loadingComplete ? 'visible' : 'hidden',
            transition: 'opacity 0.5s ease, visibility 0.5s ease'
          }}
        >
          <QuranLoader 
            text={loadingText} 
            size={80} 
            showText={true}
          />
        </Box>
      </Fade>

      {/* المحتوى الرئيسي */}
      <AnimationWrapper show={showContent}>
        <Box sx={{ minHeight: '100vh' }}>
          {staggerChildren ? (
            <StaggeredChildren>{children}</StaggeredChildren>
          ) : (
            children
          )}
        </Box>
      </AnimationWrapper>
    </Box>
  );
};

export default PageLoader;
