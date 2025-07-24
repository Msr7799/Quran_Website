// مشغل صوتي مبسط ومحسن - يمنع التحميل المبكر للصوت
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Slider,
  Alert
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  VolumeUp, 
  VolumeOff 
} from '@mui/icons-material';
import { 
  fetchSurahsMetadata, 
  fetchRecitersData, 
  getAudioUrlForSurah,
  isValidSurahNumber,
  isValidReciterId,
  formatTime
} from '../../utils/simpleQuranAPI';

const SimpleAudioPlayerFixed = ({ 
  surahNumber = null, 
  reciterId = null,
  onSurahChange,
  onReciterChange 
}) => {
  // حالات البيانات الأساسية
  const [surahs, setSurahs] = useState([]);
  const [reciters, setReciters] = useState([]);
  
  // حالات الاختيار
  const [selectedSurah, setSelectedSurah] = useState(surahNumber);
  const [selectedReciter, setSelectedReciter] = useState(reciterId);
  
  // حالات المشغل
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // حالات التحميل والأخطاء
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const audioRef = useRef(null);

  // تحميل البيانات الأساسية عند بدء التشغيل
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('🔄 تحميل البيانات الأساسية للمشغل...');
      
      try {
        const [surahsData, recitersData] = await Promise.all([
          fetchSurahsMetadata(),
          fetchRecitersData()
        ]);
        
        setSurahs(surahsData);
        setReciters(recitersData);
        
        console.log('✅ تم تحميل البيانات الأساسية:', {
          surahs: surahsData.length,
          reciters: recitersData.length
        });
        
      } catch (error) {
        console.error('❌ خطأ في تحميل البيانات الأساسية:', error);
        setError('فشل في تحميل البيانات الأساسية');
      }
    };
    
    loadInitialData();
  }, []);

  // تحديث الاختيارات عند تغيير الخصائص
  useEffect(() => {
    if (surahNumber !== selectedSurah) {
      setSelectedSurah(surahNumber);
    }
  }, [surahNumber]);

  useEffect(() => {
    if (reciterId !== selectedReciter) {
      setSelectedReciter(reciterId);
    }
  }, [reciterId]);

  // تحميل الصوت فقط عند اختيار القارئ والسورة معاً
  useEffect(() => {
    const loadAudio = async () => {
      // التحقق الصارم: يجب اختيار القارئ والسورة معاً
      if (!isValidSurahNumber(selectedSurah) || !isValidReciterId(selectedReciter)) {
        console.log('⏸️ منع التحميل - لم يتم اختيار القارئ والسورة معاً:', {
          surah: selectedSurah,
          reciter: selectedReciter,
          surahValid: isValidSurahNumber(selectedSurah),
          reciterValid: isValidReciterId(selectedReciter)
        });
        
        // إعادة تعيين الصوت إذا كان موجود
        if (audioRef.current && audioRef.current.src) {
          audioRef.current.src = '';
          setAudioUrl(null);
          setIsPlaying(false);
          setCurrentTime(0);
          setDuration(0);
        }
        
        return;
      }

      console.log('🎯 ✅ تم اختيار القارئ والسورة - بدء تحميل الصوت:', {
        surah: selectedSurah,
        reciter: selectedReciter
      });

      setIsLoading(true);
      setError(null);

      try {
        const url = await getAudioUrlForSurah(selectedSurah, selectedReciter);
        
        if (url && audioRef.current) {
          console.log('🎵 تم العثور على رابط الصوت:', url);
          
          // إيقاف التشغيل الحالي
          if (isPlaying) {
            setIsPlaying(false);
            audioRef.current.pause();
          }
          
          // تحديث المصدر
          audioRef.current.src = url;
          setAudioUrl(url);
          
          // إعادة تعيين القيم
          setCurrentTime(0);
          setDuration(0);
          
          console.log('✅ تم تحديث مصدر الصوت بنجاح');
          
        } else {
          console.warn('⚠️ لم يتم العثور على رابط الصوت');
          setError('لم يتم العثور على الملف الصوتي');
        }
        
      } catch (error) {
        console.error('❌ خطأ في تحميل الصوت:', error);
        setError('خطأ في تحميل الملف الصوتي');
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [selectedSurah, selectedReciter]);

  // معالجة أحداث الصوت
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      console.log('📊 تم تحميل معلومات الصوت - المدة:', formatTime(audio.duration));
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      console.log('🏁 انتهى تشغيل الصوت');
    };

    const handleError = (e) => {
      console.error('❌ خطأ في تشغيل الصوت:', e);
      setError('خطأ في تشغيل الملف الصوتي');
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  // دوال التحكم
  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) {
      console.log('⚠️ لا يوجد ملف صوتي للتشغيل');
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('⏸️ تم إيقاف التشغيل');
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      console.log('▶️ تم بدء التشغيل');
    }
  };

  const handleSurahSelection = (surahNumber) => {
    console.log('📖 تم اختيار السورة:', surahNumber);
    setSelectedSurah(surahNumber);
    if (onSurahChange) onSurahChange(surahNumber);
  };

  const handleReciterSelection = (reciterId) => {
    console.log('👤 تم اختيار القارئ:', reciterId);
    setSelectedReciter(reciterId);
    if (onReciterChange) onReciterChange(reciterId);
  };

  const handleSeek = (event, newValue) => {
    if (audioRef.current && duration > 0) {
      const seekTime = (newValue / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    const newVolume = newValue / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // الحصول على معلومات السورة والقارئ المختارين
  const currentSurah = surahs.find(s => s.number === selectedSurah);
  const currentReciter = reciters.find(r => r.id === selectedReciter);

  // دالة التنقل للسورة السابقة
  const goToPreviousSurah = () => {
    if (selectedSurah && selectedSurah > 1) {
      const newSurah = selectedSurah - 1;
      setSelectedSurah(newSurah);
      if (onSurahChange) {
        onSurahChange(newSurah);
      }
    }
  };

  // دالة التنقل للسورة التالية
  const goToNextSurah = () => {
    if (selectedSurah && selectedSurah < 114) {
      const newSurah = selectedSurah + 1;
      setSelectedSurah(newSurah);
      if (onSurahChange) {
        onSurahChange(newSurah);
      }
    }
  };

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '100%',
      mx: 'auto',
      p: 1,
      bgcolor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      height: '50px',
      flexWrap: 'nowrap',
      overflow: 'hidden'
    }}>
      {/* عنصر الصوت المخفي */}
      <audio ref={audioRef} preload="none" />

      {/* رسالة الخطأ */}
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 1 }}>
          {error}
        </Alert>
      )}

      {/* مشغل مضغوط في صف واحد */}

        {/* زر السورة السابقة */}
        <IconButton
          onClick={goToPreviousSurah}
          disabled={!selectedSurah || selectedSurah <= 1}
          sx={{
            color: 'tomato',
            border: '1px solid rgba(255, 99, 71, 0.3)',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(255, 99, 71, 0.1)',
              borderColor: 'rgba(255, 99, 71, 0.5)',
            },
            '&:disabled': {
              color: 'rgba(255, 99, 71, 0.3)',
              borderColor: 'rgba(255, 99, 71, 0.2)',
            }
          }}
          title="السورة السابقة"
        >
          ‹
        </IconButton>

        {/* اختيار القارئ */}
        <FormControl sx={{ minWidth: 140, flex: 1 }} size="small">
          <InputLabel sx={{ color: '#333' }}>القارئ</InputLabel>
          <Select
            value={selectedReciter || ''}
            onChange={(e) => handleReciterSelection(e.target.value)}
            label="القارئ"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: '#333',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              },
              '& .MuiSelect-select': {
                color: '#333'
              }
            }}
          >
            <MenuItem value="">
              <em>اختر القارئ</em>
            </MenuItem>
            {reciters.slice(0, 20).map((reciter) => (
              <MenuItem key={reciter.id} value={reciter.id} sx={{ color: '#333' }}>
                {reciter.reciter.ar}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* اختيار السورة */}
        <FormControl sx={{ minWidth: 140, flex: 1 }} size="small">
          <InputLabel sx={{ color: '#333' }}>السورة</InputLabel>
          <Select
            value={selectedSurah || ''}
            onChange={(e) => handleSurahSelection(e.target.value)}
            label="السورة"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: '#333',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              },
              '& .MuiSelect-select': {
                color: '#333'
              }
            }}
          >
            <MenuItem value="">
              <em>اختر السورة</em>
            </MenuItem>
            {surahs.map((surah) => (
              <MenuItem key={surah.number} value={surah.number} sx={{ color: '#333' }}>
                {surah.number}. {surah.name.ar}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* زر السورة التالية */}
        <IconButton
          onClick={goToNextSurah}
          disabled={!selectedSurah || selectedSurah >= 114}
          sx={{
            color: 'tomato',
            border: '1px solid rgba(255, 99, 71, 0.3)',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(255, 99, 71, 0.1)',
              borderColor: 'rgba(255, 99, 71, 0.5)',
            },
            '&:disabled': {
              color: 'rgba(255, 99, 71, 0.3)',
              borderColor: 'rgba(255, 99, 71, 0.2)',
            }
          }}
          title="السورة التالية"
        >
          ›
        </IconButton>
      </Box>

      {/* الصف الثاني: أزرار التحكم وشريط التقدم */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        width: '100%'
      }}>
        {/* زر التشغيل/الإيقاف */}
        <IconButton
          onClick={handlePlayPause}
          disabled={!audioUrl || isLoading}
          size="large"
          sx={{
            color: 'tomato',
            bgcolor: 'rgba(255, 99, 71, 0.1)',
            border: '2px solid rgba(255, 99, 71, 0.3)',
            borderRadius: '12px',
            width: '50px',
            height: '50px',
            '&:hover': {
              bgcolor: 'rgba(255, 99, 71, 0.2)',
              borderColor: 'rgba(255, 99, 71, 0.5)',
              transform: 'scale(1.05)',
            },
            '&:disabled': {
              color: 'rgba(255, 99, 71, 0.5)',
              borderColor: 'rgba(255, 99, 71, 0.2)',
              bgcolor: 'rgba(255, 99, 71, 0.05)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          {isLoading ? '⏳' : (isPlaying ? <Pause sx={{ fontSize: 28 }} /> : <PlayArrow sx={{ fontSize: 28 }} />)}
        </IconButton>

        {/* شريط التقدم مع الأوقات */}
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Slider
            value={duration > 0 ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            disabled={!audioUrl || duration === 0}
            sx={{
              color: 'tomato',
              height: 6,
              '& .MuiSlider-thumb': {
                color: 'tomato',
                width: 16,
                height: 16,
                '&:hover': {
                  boxShadow: '0 0 0 8px rgba(255, 99, 71, 0.16)',
                }
              },
              '& .MuiSlider-track': {
                color: 'tomato',
                border: 'none'
              },
              '& .MuiSlider-rail': {
                color: 'rgba(255, 99, 71, 0.3)',
                opacity: 1
              }
            }}
          />
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 0.5
          }}>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>

        {/* التحكم في الصوت */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={toggleMute}
            size="small"
            sx={{
              color: 'tomato',
              bgcolor: 'rgba(255, 99, 71, 0.1)',
              border: '1px solid rgba(255, 99, 71, 0.3)',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: 'rgba(255, 99, 71, 0.2)',
                borderColor: 'rgba(255, 99, 71, 0.5)',
              }
            }}
          >
            {isMuted ? <VolumeOff sx={{ fontSize: 20 }} /> : <VolumeUp sx={{ fontSize: 20 }} />}
          </IconButton>

          <Box sx={{ width: 80 }}>
            <Slider
              value={volume * 100}
              onChange={handleVolumeChange}
              disabled={!audioUrl}
              size="small"
              sx={{
                color: 'tomato',
                '& .MuiSlider-thumb': {
                  color: 'tomato',
                  width: 12,
                  height: 12
                },
                '& .MuiSlider-track': {
                  color: 'tomato'
                },
                '& .MuiSlider-rail': {
                  color: 'rgba(255, 99, 71, 0.3)'
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* الصف الثالث: معلومات التشغيل */}
      {currentSurah && currentReciter && (
        <Box sx={{
          width: '100%',
          textAlign: 'center',
          bgcolor: 'rgba(255, 99, 71, 0.05)',
          borderRadius: '8px',
          p: 1,
          border: '1px solid rgba(255, 99, 71, 0.2)'
        }}>
          <Typography variant="body2" sx={{
            color: '#333',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            🎵 {currentSurah.name.ar} - {currentReciter.reciter.ar}
          </Typography>
        </Box>
      )}

      {/* رسالة التوجيه */}
      {(!selectedSurah || !selectedReciter) && (
        <Box sx={{
          width: '100%',
          textAlign: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '8px',
          p: 1.5,
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="body2" sx={{
            color: '#666',
            fontWeight: 500
          }}>
            {!selectedReciter && !selectedSurah
              ? '📚 اختر القارئ والسورة لبدء التشغيل'
              : !selectedReciter
                ? '🎤 اختر القارئ لبدء التشغيل'
                : '📖 اختر السورة لبدء التشغيل'
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SimpleAudioPlayerFixed;
