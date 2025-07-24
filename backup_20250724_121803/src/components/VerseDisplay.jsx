// ===================================
// src/components/VerseDisplay.jsx - تأثيرات fade محسنة وسلسة
// ===================================

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, IconButton, LinearProgress, CircularProgress, Collapse } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { PlayArrow, Pause, MenuBook, Close } from '@mui/icons-material';
import { Fade, Zoom } from '@mui/material';

// تحريك fade in سلس ومحسن - أكثر نعومة
const fadeInSmooth = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.92);
    filter: blur(6px);
  }
  30% {
    opacity: 0.3;
    transform: translateY(15px) scale(0.96);
    filter: blur(3px);
  }
  70% {
    opacity: 0.8;
    transform: translateY(5px) scale(0.98);
    filter: blur(1px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0px);
  }
`;

// تحريك fade out سلس ومحسن - أكثر نعومة
const fadeOutSmooth = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0px);
  }
  30% {
    opacity: 0.8;
    transform: translateY(-5px) scale(0.98);
    filter: blur(1px);
  }
  70% {
    opacity: 0.3;
    transform: translateY(-15px) scale(0.96);
    filter: blur(3px);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0.92);
    filter: blur(6px);
  }
`;

// تحريك النص القرآني مع تأثير لطيف ومحسن
const textFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(15px);
    letter-spacing: 1px;
  }
  50% {
    opacity: 0.6;
    transform: translateY(8px);
    letter-spacing: 0.5px;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    letter-spacing: normal;
  }
`;

// تحريك معلومات الآية
const infoFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

// Container للآية - موضع نسبي داخل الحاوية الثابتة مع z-index محسن
const VerseWrapper = styled(Box)(({ theme, isVisible }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '800px',
  animation: isVisible 
    ? `${fadeInSmooth} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
    : `${fadeOutSmooth} 0.6s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards`,
  pointerEvents: isVisible ? 'auto' : 'none',
  zIndex: isVisible ? 1100 : 1000, // z-index أعلى لضمان الظهور فوق المحتوى
  '@media (max-width: 768px)': {
    width: '95%',
    animation: isVisible 
      ? `${fadeInSmooth} 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`
      : `${fadeOutSmooth} 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards`,
  },
}));

const VerseCard = styled(Card)(({ theme, isVisible }) => ({
  background: theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.98)' 
    : 'rgba(30, 30, 30, 0.98)',
  borderRadius: '24px',
  boxShadow: isVisible 
    ? '0 20px 60px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)' 
    : '0 10px 40px rgba(0,0,0,0.2)',
  border: `2px solid ${theme.palette.mode === 'light' ? '#e3f2fd' : '#404040'}`,
  backdropFilter: 'blur(20px)',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
  '&:hover': {
    transform: isVisible ? 'translateY(-2px)' : 'translateY(8px)',
    boxShadow: isVisible 
      ? '0 24px 72px rgba(0,0,0,0.35), 0 12px 32px rgba(0,0,0,0.25)' 
      : '0 12px 48px rgba(0,0,0,0.25)',
  },
  '@media (max-width: 768px)': {
    borderRadius: '20px',
    boxShadow: isVisible 
      ? '0 12px 36px rgba(0,0,0,0.25)' 
      : '0 6px 24px rgba(0,0,0,0.2)',
  },
}));

const VerseContent = styled(CardContent)(({ theme }) => ({
  padding: '24px 32px',
  position: 'relative',
  '&:last-child': {
    paddingBottom: '24px',
  },
  '@media (max-width: 768px)': {
    padding: '20px 24px',
  },
}));

const VerseText = styled(Typography)(({ theme, isVisible }) => ({
  fontFamily: 'hafs, "Noto Sans Arabic", Arial, sans-serif',
  fontSize: '1.8rem',
  fontWeight: '500',
  color: theme.palette.mode === 'light' ? '#1a1a1a' : '#ffffff',
  lineHeight: '1.8',
  textAlign: 'center',
  direction: 'rtl',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '16px',
  animation: isVisible 
    ? `${textFadeIn} 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards`
    : 'none',
  opacity: isVisible ? 1 : 0,
  transition: 'all 0.4s ease',
  '@media (max-width: 768px)': {
    fontSize: '1.4rem',
    lineHeight: '1.6',
    animation: isVisible 
      ? `${textFadeIn} 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards`
      : 'none',
  },
  '@media (max-width: 480px)': {
    fontSize: '1.2rem',
  },
}));

const VerseInfo = styled(Box)(({ theme, isVisible }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  marginBottom: '12px',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDelay: isVisible ? '0.4s' : '0s',
  '@media (max-width: 768px)': {
    gap: '12px',
    transitionDelay: isVisible ? '0.3s' : '0s',
  },
}));

const VerseNumber = styled(Typography)(({ theme, isVisible }) => ({
  fontFamily: 'hafs, Arial, sans-serif',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: theme.palette.mode === 'light' ? '#1976d2' : '#64b5f6',
  backgroundColor: theme.palette.mode === 'light' ? '#e3f2fd' : '#1e3a8a',
  padding: '8px 16px',
  borderRadius: '20px',
  border: `2px solid ${theme.palette.mode === 'light' ? '#1976d2' : '#3b82f6'}`,
  transition: 'all 0.3s ease',
  transform: isVisible ? 'scale(1)' : 'scale(0.9)',
  opacity: isVisible ? 1 : 0,
  '@media (max-width: 768px)': {
    fontSize: '1rem',
    padding: '6px 12px',
  },
}));

const PlayButton = styled(IconButton)(({ theme, isVisible }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#1976d2' : '#3b82f6',
  color: 'white',
  width: '48px',
  height: '48px',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-10deg)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDelay: isVisible ? '0.5s' : '0s',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? '#1565c0' : '#2563eb',
    transform: isVisible ? 'scale(1.05) rotate(0deg)' : 'scale(0.85) rotate(-10deg)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
  '@media (max-width: 768px)': {
    width: '40px',
    height: '40px',
    transitionDelay: isVisible ? '0.4s' : '0s',
  },
}));

const ProgressContainer = styled(Box)(({ theme, isVisible }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginTop: '8px',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDelay: isVisible ? '0.6s' : '0s',
  '@media (max-width: 768px)': {
    gap: '8px',
    transitionDelay: isVisible ? '0.5s' : '0s',
  },
}));

const TimeText = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  color: theme.palette.mode === 'light' ? '#64748b' : '#94a3b8',
  minWidth: '45px',
  textAlign: 'center',
  '@media (max-width: 768px)': {
    fontSize: '0.8rem',
    minWidth: '40px',
  },
}));

const CustomProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: '6px',
  borderRadius: '3px',
  backgroundColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#555',
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.mode === 'light' ? '#1976d2' : '#3b82f6',
    borderRadius: '3px',
    transition: 'all 0.3s ease',
  },
}));

// أنماط جديدة للتفسير
const VerseTextClickable = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs, "Noto Sans Arabic", Arial, sans-serif',
  fontSize: '1.8rem',
  fontWeight: '500',
  color: theme.palette.mode === 'light' ? '#1a1a1a' : '#ffffff',
  lineHeight: '1.8',
  textAlign: 'center',
  direction: 'rtl',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '16px',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.05)' : 'rgba(100, 181, 246, 0.05)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
  },
  '@media (max-width: 768px)': {
    fontSize: '1.4rem',
    lineHeight: '1.6',
  },
  '@media (max-width: 480px)': {
    fontSize: '1.2rem',
  },
}));

const TafseerContainer = styled(Box)(({ theme }) => ({
  marginTop: '16px',
  width: '100%',
}));

const TafseerCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : '#2d2d2d',
  border: `1px solid ${theme.palette.mode === 'light' ? '#e9ecef' : '#404040'}`,
  borderRadius: '16px',
  overflow: 'hidden',
}));

const TafseerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: theme.palette.mode === 'light' ? '#e3f2fd' : '#1e3a8a',
  borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#bbdefb' : '#3b82f6'}`,
}));

const TafseerTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs, Arial, sans-serif',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: theme.palette.mode === 'light' ? '#1565c0' : '#90caf9',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const TafseerContent = styled(CardContent)(({ theme }) => ({
  padding: '16px',
  '&:last-child': {
    paddingBottom: '16px',
  },
}));

const TafseerText = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs, "Noto Sans Arabic", Arial, sans-serif',
  fontSize: '1.1rem',
  lineHeight: '1.8',
  color: theme.palette.mode === 'light' ? '#2c3e50' : '#ecf0f1',
  direction: 'rtl',
  textAlign: 'justify',
  '@media (max-width: 768px)': {
    fontSize: '1rem',
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  gap: '12px',
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs, Arial, sans-serif',
  color: theme.palette.mode === 'light' ? '#1976d2' : '#64b5f6',
  fontSize: '0.9rem',
}));

export default function VerseDisplay({ 
  isVisible, 
  onTogglePlayPause, 
  isPlaying, 
  surahNumber, 
  verseNumber, 
  currentTime, 
  totalDuration 
}) {
  const [verseText, setVerseText] = useState('');
  const [surahName, setSurahName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRendered, setIsRendered] = useState(false);
  
  // حالات جديدة للتفسير
  const [tafseerText, setTafseerText] = useState('');
  const [showTafseer, setShowTafseer] = useState(false);
  const [isLoadingTafseer, setIsLoadingTafseer] = useState(false);
  const [tafseerError, setTafseerError] = useState('');
  
  // معرف التفسير - يمكن تغييره لتفاسير مختلفة
  const DEFAULT_TAFSEER_ID = 1; // التفسير الميسر

  // جلب نص الآية من API التفسير
  const fetchVerseText = async (surahNum, verseNum) => {
    try {
      const response = await fetch(`http://api.quran-tafseer.com/quran/${surahNum}/${verseNum}`);
      if (response.ok) {
        const data = await response.json();
        return {
          text: data.text || `آية ${verseNum} من سورة ${surahNum}`,
          surahName: data.sura_name || `سورة رقم ${surahNum}`
        };
      }
    } catch (error) {
      console.error('خطأ في جلب نص الآية:', error);
    }
    // إرجاع قيم افتراضية في حالة الخطأ
    return {
      text: `آية ${verseNum} من سورة ${surahNum}`,
      surahName: `سورة رقم ${surahNum}`
    };
  };

  // جلب التفسير من API
  const fetchTafseer = async (surahNum, verseNum) => {
    setIsLoadingTafseer(true);
    setTafseerError('');
    
    try {
      const response = await fetch(`http://api.quran-tafseer.com/tafseer/${DEFAULT_TAFSEER_ID}/${surahNum}/${verseNum}`);
      if (response.ok) {
        const data = await response.json();
        setTafseerText(data.text || 'لم يتم العثور على تفسير لهذه الآية');
        setShowTafseer(true);
      } else {
        setTafseerError('لم يتم العثور على تفسير لهذه الآية');
      }
    } catch (error) {
      console.error('خطأ في جلب التفسير:', error);
      setTafseerError('حدث خطأ في جلب التفسير. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoadingTafseer(false);
    }
  };

  // معالجة الضغط على الآية
  const handleVerseClick = () => {
    // إيقاف مشغل الصوت
    if (isPlaying) {
      onTogglePlayPause();
    }
    
    // جلب التفسير
    fetchTafseer(surahNumber, verseNumber);
  };

  // إغلاق التفسير
  const handleCloseTafseer = () => {
    setShowTafseer(false);
    setTafseerText('');
    setTafseerError('');
  };

  // جلب نص الآية عند تغيير رقم السورة أو الآية
  useEffect(() => {
    if (surahNumber && verseNumber && isVisible) {
      setIsLoading(true);
      
      // جلب نص الآية من API التفسير
      fetchVerseText(surahNumber, verseNumber)
        .then(({ text, surahName }) => {
          setVerseText(text);
          setSurahName(surahName);
          setIsLoading(false);
        });
    }
  }, [surahNumber, verseNumber, isVisible]);

  // التحكم في حالة الرندر للأنميشن
  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
    } else {
      // تأخير إزالة العنصر حتى انتهاء الأنميشن
      const timeout = setTimeout(() => {
        setIsRendered(false);
        // إغلاق التفسير عند إخفاء الآية
        handleCloseTafseer();
      }, 400); // نفس مدة أنميشن fadeOut
      
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  // تنسيق الوقت
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // حساب نسبة التقدم
  const getProgressPercentage = () => {
    if (totalDuration === 0) return 0;
    return Math.min((currentTime / totalDuration) * 100, 100);
  };

  if (!isRendered || isLoading) {
    return null;
  }

  return (
    <VerseWrapper isVisible={isVisible}>
      <VerseCard elevation={8}>
        <VerseContent>
          {/* معلومات الآية */}
          <VerseInfo>
            <Zoom in={isVisible} style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>
              <VerseNumber>
                {surahName} - آية {verseNumber}
              </VerseNumber>
            </Zoom>
            <Zoom in={isVisible} style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
              <PlayButton onClick={onTogglePlayPause}>
                {isPlaying ? (
                  <Pause sx={{ fontSize: '24px' }} />
                ) : (
                  <PlayArrow sx={{ fontSize: '24px' }} />
                )}
              </PlayButton>
            </Zoom>
          </VerseInfo>

          {/* نص الآية - قابل للضغط لعرض التفسير */}
          <Fade in={isVisible} timeout={{ enter: 600, exit: 300 }}>
            <VerseTextClickable onClick={handleVerseClick}>
              {verseText}
            </VerseTextClickable>
          </Fade>

          {/* قسم التفسير */}
          <TafseerContainer>
            {/* سبنر التحميل */}
            {isLoadingTafseer && (
              <LoadingContainer>
                <CircularProgress size={24} />
                <LoadingText>جاري جلب التفسير...</LoadingText>
              </LoadingContainer>
            )}
            
            {/* رسالة الخطأ */}
            {tafseerError && (
              <Fade in={true}>
                <TafseerCard>
                  <TafseerContent>
                    <TafseerText style={{ color: '#f44336' }}>
                      {tafseerError}
                    </TafseerText>
                  </TafseerContent>
                </TafseerCard>
              </Fade>
            )}
            
            {/* عرض التفسير */}
            <Collapse in={showTafseer && !isLoadingTafseer && !tafseerError}>
              <TafseerCard>
                <TafseerHeader>
                  <TafseerTitle>
                    <MenuBook />
                    التفسير الميسر
                  </TafseerTitle>
                  <IconButton 
                    size="small" 
                    onClick={handleCloseTafseer}
                    sx={{ color: 'inherit' }}
                  >
                    <Close />
                  </IconButton>
                </TafseerHeader>
                <TafseerContent>
                  <TafseerText>
                    {tafseerText}
                  </TafseerText>
                </TafseerContent>
              </TafseerCard>
            </Collapse>
          </TafseerContainer>

          {/* شريط التقدم */}
          <Fade in={isVisible} timeout={{ enter: 800, exit: 200 }}>
            <ProgressContainer>
              <TimeText>{formatTime(currentTime)}</TimeText>
              <Box sx={{ flex: 1 }}>
                <CustomProgressBar 
                  variant="determinate" 
                  value={getProgressPercentage()} 
                />
              </Box>
              <TimeText>{formatTime(totalDuration)}</TimeText>
            </ProgressContainer>
          </Fade>
        </VerseContent>
      </VerseCard>
    </VerseWrapper>
  );
}
