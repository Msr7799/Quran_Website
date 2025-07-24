// ===================================
// src/components/EnhancedAudioPlayer.jsx - المشغل المحسن بدون تداخل مع الآيات
// ===================================

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Slider, 
  Card, 
  CardContent,
  Chip,
  Fade,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Close,
  VolumeUp,
  VolumeDown,
  Replay10,
  Forward10,
  AccessTime,
  Visibility
} from '@mui/icons-material';

// Styled Components للمشغل المحسن - مع تحسينات لتجنب التداخل
const PlayerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  bottom: '20px',
  left: '50%',
  width: '90%',

  transform: 'translateX(-50%)',
  maxWidth: '800px',
  zIndex: 1000, // تقليل z-index لتجنب التداخل مع الآيات
  '@media (max-width: 768px)': {
    bottom: '10px',
    width: '95%',
    maxWidth: '95%',

  },
}));

const PlayerCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.95)' // شفافية أكثر
    : 'rgba(30, 30, 30, 0.95)',
  borderRadius: '20px', // تقليل نصف القطر
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  border: `1px solid ${theme.palette.mode === 'light' ? '#e3e8ef' : '#404040'}`,
  backdropFilter: 'blur(15px)',
  overflow: 'visible',
  // تحسين للشاشات الصغيرة
  '@media (max-width: 768px)': {
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
  },
}));

const PlayerContent = styled(CardContent)(({ theme }) => ({
  padding: '16px 20px', // تقليل padding
  '&:last-child': {
    paddingBottom: '16px',
  },
  '@media (max-width: 768px)': {
    padding: '12px 16px',
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px', // تقليل المسافة
  direction: 'rtl',
}));

const TitleSection = styled(Box)(({ theme }) => ({
  flex: 1,
  textAlign: 'right',
  marginRight: '12px',
}));

const ReciterName = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs, Arial, sans-serif',
  fontSize: '1.1rem', // تقليل الحجم
  fontWeight: 'bold',
  color: theme.palette.mode === 'light' ? '#2c3e50' : '#ecf0f1',
  marginBottom: '2px',
  '@media (max-width: 768px)': {
    fontSize: '1rem',
  },
}));

const SurahName = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs, Arial, sans-serif',
  fontSize: '0.9rem', // تقليل الحجم
  color: theme.palette.mode === 'light' ? '#64748b' : '#94a3b8',
  '@media (max-width: 768px)': {
    fontSize: '0.8rem',
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#404040',
  color: theme.palette.mode === 'light' ? '#666' : '#ccc',
  width: '32px', // تقليل الحجم
  height: '32px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#505050',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
}));

const ProgressSection = styled(Box)(({ theme }) => ({
  marginBottom: '12px', // تقليل المسافة
}));

const ProgressSlider = styled(Slider)(({ theme }) => ({
  height: '4px', // تقليل الارتفاع
  '& .MuiSlider-track': {
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
    border: 'none',
    height: '4px',
  },
  '& .MuiSlider-thumb': {
    width: '14px', // تقليل الحجم
    height: '14px',
    backgroundColor: '#1976d2',
    border: '2px solid #ffffff',
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
    },
    '&.Mui-active': {
      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.5)',
    },
  },
  '& .MuiSlider-rail': {
    backgroundColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#555',
    height: '4px',
  },
}));

const TimeInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '6px', // تقليل المسافة
  fontSize: '0.75rem', // تقليل الحجم
  color: theme.palette.mode === 'light' ? '#64748b' : '#94a3b8',
  direction: 'ltr',
}));

const ControlsSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px', // تقليل المسافة
  marginBottom: '12px',
}));

const MainPlayButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#1976d2',
  color: 'white',
  width: '48px', // تقليل الحجم
  height: '48px',
  margin: '0 12px',
  '&:hover': {
    backgroundColor: '#1565c0',
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
}));

const SecondaryButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#404040',
  color: theme.palette.mode === 'light' ? '#666' : '#ccc',
  width: '36px', // تقليل الحجم
  height: '36px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#505050',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));

const InfoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '6px', // تقليل المسافة
  direction: 'rtl',
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#e3f2fd' : '#1e3a8a',
  color: theme.palette.mode === 'light' ? '#1565c0' : '#90caf9',
  fontSize: '0.7rem', // تقليل الحجم
  height: '24px',
  fontFamily: 'hafs, Arial, sans-serif',
  '& .MuiChip-icon': {
    color: 'inherit',
    fontSize: '14px',
  },
}));

const VolumeSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px', // تقليل المسافة
  minWidth: '100px',
  '@media (max-width: 768px)': {
    minWidth: '80px',
  },
}));

const VolumeSlider = styled(Slider)(({ theme }) => ({
  height: '3px', // تقليل الارتفاع
  '& .MuiSlider-track': {
    backgroundColor: '#1976d2',
    border: 'none',
    height: '3px',
  },
  '& .MuiSlider-thumb': {
    width: '10px', // تقليل الحجم
    height: '10px',
    backgroundColor: '#1976d2',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
    },
  },
  '& .MuiSlider-rail': {
    backgroundColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#555',
    height: '3px',
  },
}));

// الجسم الرئيسي للمشغل - تحسين الأداء
const EnhancedAudioPlayer = forwardRef(({ 
  src, 
  onClose, 
  onNext, 
  onPrev, 
  onPlay, 
  onPause, 
  onTimeUpdate,
  prevSurah, 
  nextSurah, 
  currentSurah, 
  reciterName,
  timingAvailable = false,
  currentVerseNumber = 0,
  totalVerses = 0
}, ref) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isLoading, setIsLoading] = useState(true);
  const [audioError, setAudioError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // تمرير مرجع الصوت للمكون الأب
  useImperativeHandle(ref, () => ({
    play: () => audioRef.current?.play(),
    pause: () => audioRef.current?.pause(),
    get currentTime() {
      return audioRef.current?.currentTime || 0;
    },
    set currentTime(time) {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    }
  }));

  // معالجة أحداث الصوت
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      console.log('[AudioPlayer] بدأ تحميل الصوت... src:', audio.src);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      console.log('[AudioPlayer] يمكن تشغيل الصوت الآن! src:', audio.src);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
      console.log('[AudioPlayer] بدأ التشغيل');
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
      console.log('[AudioPlayer] تم الإيقاف المؤقت');
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        const current = audio.currentTime;
        setCurrentTime(current);
        onTimeUpdate?.(current);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      console.log('[AudioPlayer] تم تحميل بيانات الملف الصوتي. المدة:', audio.duration);
    };

    const handleVolumeChange = () => {
      setVolume(audio.volume * 100);
      console.log('[AudioPlayer] تغيير مستوى الصوت:', audio.volume * 100);
    };

    const handleError = () => {
      setIsLoading(false);
      setAudioError(true);
      console.error('[AudioPlayer] حدث خطأ أثناء تحميل الصوت! src:', audio.src);
    };

    // إضافة مستمعي الأحداث
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('error', handleError);

    // تنظيف المستمعين
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('error', handleError);
    };
  }, [onPlay, onPause, onTimeUpdate, isDragging]);

  // تحديث المصدر عند تغيير الـ src
  useEffect(() => {
    if (audioRef.current && src) {
      audioRef.current.src = src;
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioError(false);
      console.log('[AudioPlayer] تم تعيين src جديد:', src);
    }
  }, [src]);

  // تحديث مستوى الصوت
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // دوال التحكم
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleProgressChange = (event, newValue) => {
    if (audioRef.current) {
      const newTime = (newValue / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressCommitted = () => {
    setIsDragging(false);
  };

  const handleProgressChangeStart = () => {
    setIsDragging(true);
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const handleFastForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
  };

  // دوال مساعدة
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  return (
    <Fade in={true} timeout={500}>
      <PlayerContainer>
        <PlayerCard elevation={6}>
          <PlayerContent>
            {/* العنوان وزر الإغلاق */}
            <HeaderSection>
              <TitleSection>
                <ReciterName>{reciterName}</ReciterName>
                <SurahName>{currentSurah}</SurahName>
              </TitleSection>
              <CloseButton onClick={onClose}>
                <Close />
              </CloseButton>
            </HeaderSection>

            {/* شريط التقدم */}
            <ProgressSection>
              {audioError ? (
                <Box sx={{ color: 'error.main', textAlign: 'center', py: 2 }}>
                  <Typography color="error" variant="body2">
                    تعذر تحميل الملف الصوتي. يرجى التأكد من الرابط أو المحاولة لاحقاً.
                  </Typography>
                </Box>
              ) : isLoading ? (
                <LinearProgress 
                  sx={{ 
                    height: '4px', 
                    borderRadius: '2px',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#1976d2',
                    }
                  }} 
                />
              ) : (
                <ProgressSlider
                  value={getProgressPercentage()}
                  onChange={handleProgressChange}
                  onChangeCommitted={handleProgressCommitted}
                  onMouseDown={handleProgressChangeStart}
                  aria-label="مؤشر التقدم"
                />
              )}
              <TimeInfo>
                <Typography variant="caption">
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption">
                  {formatTime(duration)}
                </Typography>
              </TimeInfo>
            </ProgressSection>

            {/* أزرار التحكم */}
            <ControlsSection>
              <Tooltip title="إرجاع 10 ثوانِ" arrow>
                <span>
                  <SecondaryButton onClick={handleRewind}>
                    <Replay10 sx={{ fontSize: '20px' }} />
                  </SecondaryButton>
                </span>
              </Tooltip>

              <Tooltip title={prevSurah ? `السورة السابقة: ${prevSurah}` : 'لا توجد سورة سابقة'} arrow>
                <span>
                  <SecondaryButton onClick={onPrev} disabled={!prevSurah}>
                    <SkipPrevious sx={{ fontSize: '20px' }} />
                  </SecondaryButton>
                </span>
              </Tooltip>

              <Tooltip title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'} arrow>
                <span>
                  <MainPlayButton onClick={handlePlayPause} disabled={isLoading}>
                    {isLoading ? (
                      <div style={{ 
                        width: '18px', 
                        height: '18px', 
                        border: '2px solid #ffffff40',
                        borderTop: '2px solid #ffffff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    ) : isPlaying ? (
                      <Pause sx={{ fontSize: '24px' }} />
                    ) : (
                      <PlayArrow sx={{ fontSize: '24px' }} />
                    )}
                  </MainPlayButton>
                </span>
              </Tooltip>

              <Tooltip title={nextSurah ? `السورة التالية: ${nextSurah}` : 'لا توجد سورة تالية'} arrow>
                <span>
                  <SecondaryButton onClick={onNext} disabled={!nextSurah}>
                    <SkipNext sx={{ fontSize: '20px' }} />
                  </SecondaryButton>
                </span>
              </Tooltip>

              <Tooltip title="تقديم 10 ثوانِ" arrow>
                <span>
                  <SecondaryButton onClick={handleFastForward}>
                    <Forward10 sx={{ fontSize: '20px' }} />
                  </SecondaryButton>
                </span>
              </Tooltip>
            </ControlsSection>

            {/* قسم المعلومات */}
            <InfoSection>
              <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {timingAvailable && (
                  <InfoChip 
                    icon={<AccessTime />}
                    label="تزامن دقيق"
                    color="primary"
                    size="small"
                  />
                )}
                
                {currentVerseNumber > 0 && (
                  <InfoChip 
                    icon={<Visibility />}
                    label={`آية ${currentVerseNumber} من ${totalVerses}`}
                    size="small"
                  />
                )}
              </Box>

              {/* التحكم في مستوى الصوت */}
              <VolumeSection>
                <VolumeDown sx={{ fontSize: '16px', color: 'text.secondary' }} />
                <VolumeSlider
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label="مستوى الصوت"
                  min={0}
                  max={100}
                />
                <VolumeUp sx={{ fontSize: '16px', color: 'text.secondary' }} />
              </VolumeSection>
            </InfoSection>
          </PlayerContent>
        </PlayerCard>

        {/* عنصر الصوت المخفي */}
        <audio
          ref={audioRef}
          preload="metadata"
          style={{ display: 'none' }}
        />

        {/* أنماط CSS للرسوم المتحركة */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

      </PlayerContainer>
    </Fade>
  );
});


EnhancedAudioPlayer.displayName = 'EnhancedAudioPlayer';

export default EnhancedAudioPlayer;