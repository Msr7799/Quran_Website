// src/components/AudioPlayer/SimpleAudioPlayer.jsx - مشغل صوتي بسيط وخفيف

import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography, Slider, Select, MenuItem, FormControl } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, VolumeOff, Person } from '@mui/icons-material';

const SimpleAudioPlayer = ({
  surahNumber,
  reciterId = 1,
  onTimeUpdate,
  onReciterChange,
  onSurahChange,
  className = ''
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [error, setError] = useState(null);
  const [surahsData, setSurahsData] = useState([]);
  const [recitersData, setRecitersData] = useState([]);

  // تحميل بيانات السور والقراء من البيانات المحلية
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsPlayerReady(false);
        // تحميل بيانات السور
        const surahsResponse = await fetch('/json/metadata.json');
        const surahs = await surahsResponse.json();
        setSurahsData(surahs);

        // تحميل بيانات القراء
        const recitersResponse = await fetch('/json/quranMp3.json');
        const reciters = await recitersResponse.json();
        setRecitersData(reciters); // جميع القراء الـ 158

        // تفعيل المشغل بعد تحميل البيانات
        setTimeout(() => {
          setIsPlayerReady(true);
        }, 600);
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        setIsPlayerReady(true); // تفعيل حتى لو فشل التحميل
      }
    };
    loadData();
  }, []);

  // بناء رابط الصوت
  const getAudioUrl = (surahNum, reciterId) => {
    const reciter = recitersData.find(r => r.id === reciterId) || recitersData[0];
    if (!reciter) return '';

    const paddedSurah = surahNum.toString().padStart(3, '0');
    return `${reciter.server}/${paddedSurah}.mp3`;
  };

  // تحديث مصدر الصوت
  useEffect(() => {
    if (audioRef.current && surahNumber) {
      const audioUrl = getAudioUrl(surahNumber, reciterId);
      console.log('🔄 تحديث مصدر الصوت للسورة رقم:', surahNumber);
      audioRef.current.src = audioUrl;
      setError(null);
      setCurrentTime(0);
      setDuration(0);

      // إيقاف التشغيل عند تغيير السورة
      if (isPlaying) {
        setIsPlaying(false);
      }
    }
  }, [surahNumber, reciterId]);

  // معالجة أحداث الصوت
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime);
      }
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError('خطأ في تحميل الملف الصوتي');
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate]);

  // تشغيل/إيقاف
  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError('خطأ في تشغيل الصوت');
      setIsPlaying(false);
    }
  };

  // تغيير موضع التشغيل
  const handleSeek = (event, newValue) => {
    if (audioRef.current && duration > 0) {
      const newTime = (newValue / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // تغيير مستوى الصوت
  const handleVolumeChange = (event, newValue) => {
    const newVolume = newValue / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // كتم/إلغاء كتم الصوت
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // تنسيق الوقت
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // حساب النسبة المئوية للتقدم
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // الحصول على اسم السورة والقارئ الحاليين
  const currentSurah = surahsData.find(s => s.number === surahNumber);
  const currentReciter = recitersData.find(r => r.id === reciterId);

  // عرض لودر بسيط إذا لم يكن المشغل جاهزاً
  if (!isPlayerReady) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '400px',
        height: '52px',
        '@media (max-width: 600px)': {
          minWidth: '300px'
        }
      }}>
        <Typography variant="caption" sx={{ color: '#666', fontSize: '12px' }}>
          جاري تحضير المشغل...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className={`simple-audio-player ${className}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        padding: '8px 16px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
        borderRadius: '20px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)',
        minWidth: '400px',
        maxWidth: '100%',
        backdropFilter: 'blur(15px)',
        border: '2px solid rgba(255, 255, 255, 0.4)',
        '@media (max-width: 600px)': {
          gap: 0.5,
          padding: '4px 8px',
          minWidth: '300px'
        }
      }}
    >
      {/* عنصر الصوت */}
      <audio 
        ref={audioRef}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* زر التشغيل/الإيقاف */}
      <IconButton
        onClick={togglePlay}
        disabled={isLoading || error}
        sx={{
          width: 44,
          height: 44,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0.1) 100%)',
          border: '2px solid rgba(25, 118, 210, 0.2)',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.25) 0%, rgba(25, 118, 210, 0.15) 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
          },
          '&:disabled': {
            opacity: 0.6,
            background: 'rgba(200, 200, 200, 0.2)'
          }
        }}
      >
        {isLoading ? (
          <Typography variant="caption" sx={{ fontSize: '10px' }}>...</Typography>
        ) : isPlaying ? (
          <Pause sx={{ fontSize: '20px' }} />
        ) : (
          <PlayArrow sx={{ fontSize: '20px' }} />
        )}
      </IconButton>

      {/* شريط التقدم والوقت */}
      <Box sx={{ flex: 1, minWidth: 0, mx: 1 }}>
        <Slider
          value={progress}
          onChange={handleSeek}
          disabled={!duration || isLoading}
          sx={{
            height: 4,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12
            },
            '& .MuiSlider-track': {
              height: 4
            },
            '& .MuiSlider-rail': {
              height: 4
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
            {formatTime(currentTime)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      {/* عرض المعلومات الحالية */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
        <Typography variant="caption" sx={{ fontSize: '9px', color: 'text.secondary' }}>
          {currentSurah?.name.ar || 'السورة'}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '8px', color: 'text.secondary' }}>
          {currentReciter?.reciter.ar || 'القارئ'}
        </Typography>
      </Box>

      {/* اختيار السورة */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={surahNumber}
          onChange={(e) => onSurahChange && onSurahChange(e.target.value)}
          displayEmpty
          sx={{
            fontSize: '10px',
            height: '32px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            '& .MuiSelect-select': {
              padding: '6px 8px'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: '1px solid rgba(0, 0, 0, 0.2)'
            }
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
                width: 200,
              },
            },
          }}
        >
          {surahsData.map((surah) => (
            <MenuItem
              key={surah.number}
              value={surah.number}
              sx={{
                fontSize: '12px',
                padding: '8px 12px',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                '&:hover': {
                  background: 'rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '10px', color: 'text.secondary', minWidth: '20px' }}>
                  {surah.number}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {surah.name.ar}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* اختيار القارئ */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={reciterId}
          onChange={(e) => onReciterChange && onReciterChange(e.target.value)}
          displayEmpty
          sx={{
            fontSize: '10px',
            height: '32px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            '& .MuiSelect-select': {
              padding: '6px 8px'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: '1px solid rgba(0, 0, 0, 0.2)'
            }
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
                width: 250,
              },
            },
          }}
        >
          {recitersData.map((reciter) => (
            <MenuItem
              key={reciter.id}
              value={reciter.id}
              sx={{
                fontSize: '12px',
                padding: '8px 12px',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                '&:hover': {
                  background: 'rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {reciter.reciter.ar}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
                  {reciter.rewaya.ar}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* تحكم الصوت */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 60 }}>
        <IconButton size="small" onClick={toggleMute} sx={{ width: 28, height: 28 }}>
          {isMuted || volume === 0 ?
            <VolumeOff sx={{ fontSize: '16px' }} /> :
            <VolumeUp sx={{ fontSize: '16px' }} />
          }
        </IconButton>
        <Slider
          value={isMuted ? 0 : volume * 100}
          onChange={handleVolumeChange}
          disabled={isMuted}
          sx={{
            width: 40,
            height: 3,
            '& .MuiSlider-thumb': {
              width: 8,
              height: 8
            }
          }}
          size="small"
        />
      </Box>

      {/* رسالة الخطأ */}
      {error && (
        <Typography variant="caption" color="error" sx={{ fontSize: '8px', maxWidth: '60px', textAlign: 'center' }}>
          خطأ
        </Typography>
      )}
    </Box>
  );
};

export default SimpleAudioPlayer;
