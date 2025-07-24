import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  FormControl,
  Select,
  MenuItem,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';

const CompactAudioPlayer = ({ 
  surahNumber, 
  reciterId, 
  onReciterChange, 
  onSurahChange 
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [reciters, setReciters] = useState([]);
  const [surahs, setSurahs] = useState([]);

  // تحميل قائمة القراء والسور
  useEffect(() => {
    const loadData = async () => {
      try {
        // تحميل القراء
        const recitersResponse = await fetch('/json/quranMp3.json');
        const recitersData = await recitersResponse.json();
        setReciters(recitersData.slice(0, 20)); // أول 20 قارئ فقط

        // تحميل السور
        const surahsResponse = await fetch('/json/metadata.json');
        const surahsData = await surahsResponse.json();
        setSurahs(surahsData);
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      }
    };
    loadData();
  }, []);

  // تحميل الصوت عند اختيار القارئ والسورة
  useEffect(() => {
    if (reciterId && surahNumber) {
      const selectedReciter = reciters.find(r => r.id === reciterId);
      if (selectedReciter) {
        const paddedSurah = surahNumber.toString().padStart(3, '0');
        const url = `${selectedReciter.server}${paddedSurah}.mp3`;
        setAudioUrl(url);
        console.log('تم تحديد رابط الصوت:', url);
      }
    } else {
      setAudioUrl('');
      setIsPlaying(false);
    }
  }, [reciterId, surahNumber, reciters]);

  // إعداد الصوت
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [audioUrl]);

  // تحديث مصدر الصوت
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.volume = volume;
    }
  }, [audioUrl, volume]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !audioUrl) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('خطأ في التشغيل:', error);
      setIsLoading(false);
    }
  };

  const handleSeek = (event, newValue) => {
    if (audioRef.current && duration > 0) {
      const newTime = (newValue / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    const newVolume = newValue / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const currentSurah = surahs.find(s => s.number === surahNumber);
  const currentReciter = reciters.find(r => r.id === reciterId);

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      width: '100%',
      height: '50px',
      bgcolor: 'transparent',
      px: 1
    }}>
      <audio ref={audioRef} preload="none" />

      {/* زر التشغيل */}
      <IconButton
        onClick={handlePlayPause}
        disabled={!audioUrl}
        size="small"
        sx={{
          bgcolor: 'tomato',
          color: 'white',
          width: 32,
          height: 32,
          minWidth: 32,
          '&:hover': { bgcolor: '#e55a4f' },
          '&:disabled': { bgcolor: 'rgba(255, 99, 71, 0.3)' }
        }}
      >
        {isLoading ? (
          <CircularProgress size={16} sx={{ color: 'white' }} />
        ) : isPlaying ? (
          <Pause sx={{ fontSize: 18 }} />
        ) : (
          <PlayArrow sx={{ fontSize: 18 }} />
        )}
      </IconButton>

      {/* شريط التقدم */}
      <Box sx={{ flex: 1, mx: 1 }}>
        <Slider
          value={duration > 0 ? (currentTime / duration) * 100 : 0}
          onChange={handleSeek}
          disabled={!audioUrl}
          size="small"
          sx={{
            color: 'tomato',
            height: 3,
            '& .MuiSlider-thumb': {
              width: 10,
              height: 10
            }
          }}
        />
      </Box>

      {/* الوقت */}
      <Typography variant="caption" sx={{ 
        fontSize: '10px',
        color: '#666',
        minWidth: '35px',
        textAlign: 'center'
      }}>
        {formatTime(currentTime)}
      </Typography>

      {/* اختيار السورة */}
      <FormControl size="small" sx={{ minWidth: 70 }}>
        <Select
          value={surahNumber || ''}
          onChange={(e) => onSurahChange(e.target.value)}
          displayEmpty
          sx={{
            fontSize: '10px',
            height: '24px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 99, 71, 0.3)'
            },
            '& .MuiSelect-select': {
              padding: '2px 8px'
            }
          }}
        >
          <MenuItem value="" sx={{ fontSize: '10px' }}>السورة</MenuItem>
          {surahs.map((surah) => (
            <MenuItem key={surah.number} value={surah.number} sx={{ fontSize: '10px' }}>
              {surah.number}. {surah.name.ar}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* اختيار القارئ */}
      <FormControl size="small" sx={{ minWidth: 80 }}>
        <Select
          value={reciterId || ''}
          onChange={(e) => onReciterChange(e.target.value)}
          displayEmpty
          sx={{
            fontSize: '10px',
            height: '24px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 99, 71, 0.3)'
            },
            '& .MuiSelect-select': {
              padding: '2px 8px'
            }
          }}
        >
          <MenuItem value="" sx={{ fontSize: '10px' }}>القارئ</MenuItem>
          {reciters.map((reciter) => (
            <MenuItem key={reciter.id} value={reciter.id} sx={{ fontSize: '10px' }}>
              {reciter.reciter.ar}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* التحكم في الصوت */}
      <IconButton
        onClick={toggleMute}
        size="small"
        sx={{
          color: 'tomato',
          width: 24,
          height: 24,
          minWidth: 24
        }}
      >
        {isMuted ? <VolumeOff sx={{ fontSize: 12 }} /> : <VolumeUp sx={{ fontSize: 12 }} />}
      </IconButton>
    </Box>
  );
};

export default CompactAudioPlayer;
