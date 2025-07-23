  
// src/components/AudioPlayer/QuranAudioPlayer.jsx - مشغل القرآن الصوتي المتقدم

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Slider,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  SkipNext, 
  SkipPrevious, 
  VolumeUp, 
  VolumeDown,
  Repeat,
  Shuffle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AyahHighlight from './AyahHighlight';

const PlayerContainer = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  boxShadow: theme.shadows[8],
  overflow: 'hidden'
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2)
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2)
}));

/**
 * مشغل القرآن الصوتي المتقدم مع تمييز الآيات
 */
const QuranAudioPlayer = ({
  surahNumber = 1,
  reciterId = 1,
  onSurahChange,
  onReciterChange,
  showAyahHighlight = true,
  svgRef,
  textRef,
  onCurrentAyahChange,
  onAyahTimingsChange
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [ayahTimings, setAyahTimings] = useState([]);
  const [audioData, setAudioData] = useState(null);
  const [surahInfo, setSurahInfo] = useState(null);
  const [error, setError] = useState(null);
  const [repeat, setRepeat] = useState(false);
  const [reciters, setReciters] = useState([]);
  const [surahs, setSurahs] = useState([]);

  // تحميل قائمة القراء والسور (مرة واحدة)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // تحميل قائمة القراء
        const recitersResponse = await fetch('/json/quranMp3.json');
        const recitersData = await recitersResponse.json();
        setReciters(recitersData);

        // تحميل قائمة السور
        const metadataResponse = await fetch('/json/metadata.json');
        const metadata = await metadataResponse.json();
        setSurahs(metadata);
      } catch (error) {
        console.error('خطأ في تحميل البيانات الأولية:', error);
      }
    };

    loadInitialData();
  }, []);

  // تحميل بيانات السورة والصوت
  useEffect(() => {
    const loadSurahData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // تحميل معلومات السورة
        const metadataResponse = await fetch('/json/metadata.json');
        const metadata = await metadataResponse.json();
        const surahData = metadata.find(s => s.number === surahNumber);
        setSurahInfo(surahData);
        
        // تحميل بيانات الصوت
        const audioResponse = await fetch(`/json/audio/audio_surah_${surahNumber}.json`);
        const audioList = await audioResponse.json();
        const selectedAudio = audioList.find(a => a.id === reciterId);
        setAudioData(selectedAudio);
        
        // تحميل توقيتات الآيات
        try {
          const timingResponse = await fetch(
            `https://mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${reciterId}`
          );
          const timingData = await timingResponse.json();
          setAyahTimings(timingData || []);

          // إرسال التوقيتات للمكون الأب
          if (onAyahTimingsChange) {
            onAyahTimingsChange(timingData || []);
          }
        } catch (timingError) {
          console.warn('Could not load ayah timings:', timingError);
          setAyahTimings([]);
          if (onAyahTimingsChange) {
            onAyahTimingsChange([]);
          }
        }
        
      } catch (err) {
        setError(`خطأ في تحميل البيانات: ${err.message}`);
        console.error('Error loading surah data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurahData();
  }, [surahNumber, reciterId]);

  // تحديث الآية الحالية بناءً على الوقت
  useEffect(() => {
    if (ayahTimings.length > 0 && currentTime > 0) {
      const currentAyahData = ayahTimings.find((ayah, index) => {
        const nextAyah = ayahTimings[index + 1];
        return currentTime >= ayah.start_time / 1000 && 
               (!nextAyah || currentTime < nextAyah.start_time / 1000);
      });
      
      if (currentAyahData && currentAyahData.ayah !== currentAyah) {
        setCurrentAyah(currentAyahData.ayah);

        // إرسال الآية الحالية للمكون الأب
        if (onCurrentAyahChange) {
          onCurrentAyahChange(currentAyahData);
        }
      }
    }
  }, [currentTime, ayahTimings, currentAyah]);

  // وظائف التحكم في التشغيل
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !audioData) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        setError('خطأ في تشغيل الصوت');
        console.error('Play error:', err);
      });
    }
  }, [isPlaying, audioData]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((_, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  }, []);

  const handleVolumeChange = useCallback((_, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue;
    }
  }, []);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (onSurahChange) {
      onSurahChange(surahNumber + 1);
    }
  };

  const handlePrevious = () => {
    if (onSurahChange && surahNumber > 1) {
      onSurahChange(surahNumber - 1);
    }
  };

  if (error) {
    return (
      <PlayerContainer>
        <CardContent>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </CardContent>
      </PlayerContainer>
    );
  }

  return (
    <PlayerContainer>
      {/* عنصر الصوت */}
      <audio
        ref={audioRef}
        src={audioData?.link}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (repeat) {
            audioRef.current?.play();
          } else {
            handleNext();
          }
        }}
        onError={() => setError('خطأ في تحميل الملف الصوتي')}
        preload="metadata"
      />

      {/* عناصر التحكم في اختيار السورة والقارئ */}
      <CardContent>
        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>السورة</InputLabel>
              <Select
                value={surahNumber}
                label="السورة"
                onChange={(e) => onSurahChange && onSurahChange(e.target.value)}
              >
                {surahs.map((surah) => (
                  <MenuItem key={surah.number} value={surah.number}>
                    {surah.number}. {surah.name.ar}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>القارئ</InputLabel>
              <Select
                value={reciterId}
                label="القارئ"
                onChange={(e) => onReciterChange && onReciterChange(e.target.value)}
              >
                {reciters.map((reciter) => (
                  <MenuItem key={reciter.id} value={reciter.id}>
                    {reciter.reciter.ar}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="h6" align="center" gutterBottom>
          {surahInfo?.name.ar || `سورة رقم ${surahNumber}`}
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          {audioData?.reciter?.ar || 'قارئ غير محدد'}
        </Typography>
        {currentAyah > 0 && (
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            الآية: {currentAyah}
          </Typography>
        )}
      </CardContent>

      {/* شريط التقدم */}
      <ProgressContainer>
        <Typography variant="caption">
          {formatTime(currentTime)}
        </Typography>
        <Slider
          value={currentTime}
          max={duration || 100}
          onChange={handleSeek}
          sx={{ flex: 1 }}
          disabled={!audioData}
        />
        <Typography variant="caption">
          {formatTime(duration)}
        </Typography>
      </ProgressContainer>

      {/* أزرار التحكم */}
      <ControlsContainer>
        <Tooltip title="السورة السابقة">
          <IconButton onClick={handlePrevious} disabled={surahNumber <= 1}>
            <SkipPrevious />
          </IconButton>
        </Tooltip>

        <Tooltip title={isPlaying ? 'إيقاف' : 'تشغيل'}>
          <IconButton 
            onClick={togglePlayPause} 
            disabled={!audioData || isLoading}
            size="large"
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': { backgroundColor: 'primary.dark' }
            }}
          >
            {isLoading ? (
              <LinearProgress size={24} />
            ) : isPlaying ? (
              <Pause />
            ) : (
              <PlayArrow />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="السورة التالية">
          <IconButton onClick={handleNext} disabled={surahNumber >= 114}>
            <SkipNext />
          </IconButton>
        </Tooltip>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
          <VolumeDown />
          <Slider
            value={volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.1}
            sx={{ width: 100 }}
          />
          <VolumeUp />
        </Box>

        <Tooltip title={repeat ? 'إلغاء التكرار' : 'تكرار'}>
          <IconButton 
            onClick={() => setRepeat(!repeat)}
            color={repeat ? 'primary' : 'default'}
          >
            <Repeat />
          </IconButton>
        </Tooltip>
      </ControlsContainer>

      {/* تمييز الآيات */}
      {showAyahHighlight && (
        <AyahHighlight
          currentAyah={currentAyah}
          ayahTimings={ayahTimings}
          svgRef={svgRef}
          textRef={textRef}
          highlightMode={svgRef ? 'svg' : 'text'}
        />
      )}
    </PlayerContainer>
  );
};

export default QuranAudioPlayer;
