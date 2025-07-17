import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Slider, 
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  VolumeUp,
  VolumeDown,
  VolumeMute,
  Close,
  Forward10,
  Replay10
} from '@mui/icons-material';

// Styled Components
const PlayerContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '100%', // استخدام العرض الكامل
  margin: '20px 0', // إزالة auto للتوسيط
  backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#1e1e1e',
  border: `2px solid ${theme.palette.primary.main}`,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  zIndex: 1500,
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s ease',
  borderRadius: '16px',
  overflow: 'hidden',
  minHeight: '120px', // تغيير إلى minHeight بدلاً من maxHeight
  '@media (max-width: 768px)': {
    margin: '15px 0',
    minHeight: '100px',
  },
  '@media (max-width: 480px)': {
    margin: '10px 0',
    minHeight: '90px',
  },
}));

const PlayerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : '#2c2c2c',
  borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#e0e0e0' : '#404040'}`,
}));

const PlayerContent = styled(Box)(({ theme }) => ({
  padding: '8px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  '@media (max-width: 768px)': {
    padding: '6px 12px',
    gap: '4px',
  },
}));

const TrackInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px',
  '@media (max-width: 768px)': {
    gap: '6px',
    marginBottom: '2px',
  },
}));

const TrackDetails = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
}));

const TrackTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: theme.palette.mode === 'light' ? '#2c3e50' : '#ecf0f1',
  marginBottom: '2px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  '@media (max-width: 768px)': {
    fontSize: '0.8rem',
  },
}));

const TrackArtist = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs',
  fontSize: '0.75rem',
  color: theme.palette.mode === 'light' ? '#7f8c8d' : '#bdc3c7',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  '@media (max-width: 768px)': {
    fontSize: '0.7rem',
  },
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  marginBottom: '6px',
  '@media (max-width: 768px)': {
    gap: '2px',
    marginBottom: '4px',
  },
}));

const MainControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  '@media (max-width: 768px)': {
    gap: '4px',
  },
}));

const PlayButton = styled(IconButton)(({ theme }) => ({
  width: '36px',
  height: '36px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  },
  '@media (max-width: 768px)': {
    width: '32px',
    height: '32px',
    '& .MuiSvgIcon-root': {
      fontSize: '1rem',
    },
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px',
  '@media (max-width: 768px)': {
    gap: '6px',
    marginBottom: '2px',
  },
}));

const TimeDisplay = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  color: theme.palette.mode === 'light' ? '#666' : '#aaa',
  minWidth: '35px',
  textAlign: 'center',
  '@media (max-width: 768px)': {
    fontSize: '0.7rem',
    minWidth: '30px',
  },
}));

const VolumeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: '120px',
}));

const AdvancedControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: '12px',
  borderTop: `1px solid ${theme.palette.mode === 'light' ? '#e0e0e0' : '#404040'}`,
}));

const ControlGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}));

// Utility functions
const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function EnhancedAudioPlayer({ 
  src, 
  onClose, 
  onNext, 
  onPrev, 
  prevSurah, 
  nextSurah,
  currentSurah,
  reciterName 
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
      } else if (nextSurah && onNext) {
        onNext();
      }
    };
    const handleError = () => {
      setError('خطأ في تشغيل الصوت');
      setIsLoading(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isRepeat, nextSurah, onNext]);

  // Auto-play when src changes
  useEffect(() => {
    if (src && audioRef.current) {
      setError('');
      setIsLoading(true);
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            setError('خطأ في تشغيل الصوت');
            setIsLoading(false);
          });
      }
    }
  }, [src]);

  // Control handlers
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setError('خطأ في تشغيل الصوت'));
    }
  };

  const handleProgressChange = (_, value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (_, value) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      setVolume(value);
    }
  };

  const handleMute = () => {
    if (audioRef.current) {
      if (volume > 0) {
        audioRef.current.volume = 0;
        setVolume(0);
      } else {
        audioRef.current.volume = 1;
        setVolume(1);
      }
    }
  };

  const handleSeek = (seconds) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setError('');
    onClose();
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeMute />;
    if (volume < 0.5) return <VolumeDown />;
    return <VolumeUp />;
  };

  return (
    <PlayerContainer elevation={8}>
      <PlayerHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip 
            label="🎵 مشغل القرآن الكريم" 
            color="primary" 
            size="small"
            sx={{ fontFamily: 'hafs', fontWeight: 'bold' }}
          />
          {isLoading && (
            <Chip 
              label="⏳ جاري التحميل..." 
              color="info" 
              size="small"
              sx={{ fontFamily: 'hafs' }}
            />
          )}
          {error && (
            <Chip 
              label={error} 
              color="error" 
              size="small"
              sx={{ fontFamily: 'hafs' }}
            />
          )}
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small" onClick={handleClose} color="error">
            <Close />
          </IconButton>
        </Box>
      </PlayerHeader>

      <PlayerContent>
        {/* Track Info */}
        <TrackInfo>
          <TrackDetails>
            <TrackTitle>
              📖 {currentSurah || 'غير محدد'}
            </TrackTitle>
            <TrackArtist>
              🎤 {reciterName || 'غير محدد'}
            </TrackArtist>
          </TrackDetails>
        </TrackInfo>

        {/* Main Controls */}
        <ControlsContainer>
          <MainControls>
            <IconButton 
              onClick={onPrev} 
              disabled={!prevSurah}
              size="large"
              title={`السورة السابقة: ${prevSurah || 'غير متاح'}`}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <SkipPrevious />
            </IconButton>
            
            <IconButton 
              onClick={() => handleSeek(-10)} 
              size="large" 
              title="إرجاع 10 ثواني"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Replay10 />
            </IconButton>
            
            <PlayButton onClick={handlePlayPause} disabled={isLoading}>
              {isLoading ? (
                <Box component="span" sx={{ fontSize: '1.5rem' }}>⏳</Box>
              ) : isPlaying ? (
                <Pause />
              ) : (
                <PlayArrow />
              )}
            </PlayButton>
            
            <IconButton 
              onClick={() => handleSeek(10)} 
              size="large" 
              title="تقديم 10 ثواني"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Forward10 />
            </IconButton>
            
            <IconButton 
              onClick={onNext} 
              disabled={!nextSurah}
              size="large"
              title={`السورة التالية: ${nextSurah || 'غير متاح'}`}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <SkipNext />
            </IconButton>
          </MainControls>
        </ControlsContainer>

        {/* Progress Bar */}
        <ProgressContainer>
          <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
          <Slider
            value={currentTime}
            max={duration || 100}
            onChange={handleProgressChange}
            sx={{
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
              },
              '& .MuiSlider-track': {
                height: 4,
              },
              '& .MuiSlider-rail': {
                height: 4,
              },
            }}
          />
          <TimeDisplay>{formatTime(duration)}</TimeDisplay>
        </ProgressContainer>

      </PlayerContent>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        style={{ display: 'none' }}
      />
    </PlayerContainer>
  );
}
