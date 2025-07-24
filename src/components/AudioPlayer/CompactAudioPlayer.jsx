import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  VolumeOff,
  OpenInNew
} from '@mui/icons-material';

// استيراد البيانات مباشرة مثل الملفين المرجعيين
import recitersData from '../../../public/json/quranMp3.json';
import surahsData from '../../../public/json/metadata.json';
import { getSurahPage } from '../../utils/surahPageMapping';

const CompactAudioPlayer = ({
  surahNumber,
  reciterId,
  onReciterChange,
  onSurahChange,
  isDarkMode = false
}) => {
  const router = useRouter();
  const audioRef = useRef(null);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [audioIsLoading, setAudioIsLoading] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(1);
  const [audioIsMuted, setAudioIsMuted] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [selectedReciter, setSelectedReciter] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);

  // استخدام البيانات المستوردة مباشرة مثل الملفين المرجعيين
  const reciters = recitersData;
  const surahs = surahsData;

  console.log('📚 تم تحميل', reciters.length, 'قارئ من البيانات المستوردة');
  console.log('📖 تم تحميل', surahs.length, 'سورة من البيانات المستوردة');

  // دالة للحصول على صفحة السورة (محسنة)
  const getSurahPage = (surahNumber) => {
    // صفحات دقيقة للسور
    const surahPages = {
      1: 1,    // الفاتحة
      2: 2,    // البقرة
      3: 50,   // آل عمران
      4: 77,   // النساء
      5: 106,  // المائدة
      6: 128,  // الأنعام
      7: 151,  // الأعراف
      8: 177,  // الأنفال
      9: 187,  // التوبة
      10: 208, // يونس
      11: 221, // هود
      12: 235, // يوسف
      13: 249, // الرعد
      14: 255, // إبراهيم
      15: 262, // الحجر
      16: 267, // النحل
      17: 282, // الإسراء
      18: 293, // الكهف
      19: 305, // مريم
      20: 312, // طه
      // يمكن إضافة المزيد
    };
    return surahPages[surahNumber] || Math.ceil(surahNumber * 5); // تقدير تقريبي
  };

  // معالجة اختيار القارئ
  const handleReciterSelect = (reciterId) => {
    const reciter = reciters.find(r => r.id === reciterId);
    setSelectedReciter(reciter);
    onReciterChange(reciterId);

    // إعادة تعيين الصوت الحالي عند تغيير القارئ
    setCurrentAudio('');

    console.log('🎤 تم اختيار القارئ:', reciter?.reciter.ar);
    console.log('🔄 تم إعادة تعيين الصوت - اختر السورة مرة أخرى');
  };

  // معالجة اختيار السورة وجلب البيانات من ملف السورة المخصص
  const handleSurahSelect = async (surahNumber) => {
    if (!selectedReciter) {
      console.log('⚠️ يرجى اختيار القارئ أولاً');
      return;
    }

    const surah = surahs.find(s => s.number === surahNumber);
    setSelectedSurah(surah);
    onSurahChange(surahNumber);

    try {
      // جلب البيانات من ملف السورة المخصص
      console.log(`📁 جلب بيانات السورة من: /json/audio/audio_surah_${surahNumber}.json`);
      const response = await fetch(`/json/audio/audio_surah_${surahNumber}.json`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const surahAudioData = await response.json();
      console.log('📊 تم تحميل بيانات السورة:', surahAudioData.length, 'قارئ');

      // البحث عن القارئ المختار في بيانات السورة
      const reciterAudio = surahAudioData.find(audio => audio.id === selectedReciter.id);

      if (reciterAudio && reciterAudio.link) {
        setCurrentAudio(reciterAudio.link);
        console.log('✅ تم العثور على رابط الصوت في ملف السورة');
        console.log('📖 السورة:', surah?.name.ar);
        console.log('🎤 القارئ:', reciterAudio.reciter.ar);
        console.log('🔗 رابط الصوت:', reciterAudio.link);
      } else {
        console.log('❌ لم يتم العثور على القارئ في ملف السورة');
        console.log('🔍 القراء المتاحون في هذه السورة:', surahAudioData.map(a => a.reciter.ar));
        setCurrentAudio('');
      }
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات السورة:', error);
      setCurrentAudio('');
    }

    // خيار الانتقال لصفحة السورة
    console.log('🔗 يمكنك الانتقال لصفحة السورة بالضغط على أيقونة الانتقال');
  };

  // دالة للانتقال لصفحة السورة
  const navigateToSurahPage = (surahNumber) => {
    const targetPage = getSurahPage(surahNumber);
    console.log(`📄 الانتقال لصفحة ${targetPage} للسورة ${surahNumber}`);
    router.push(`/quran-pages/${targetPage}`);
  };

  // إعداد الصوت
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      setAudioIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setAudioCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setAudioIsPlaying(false);
      setAudioCurrentTime(0);
    };

    const handleLoadStart = () => {
      setAudioIsLoading(true);
      console.log('🔄 بدء تحميل الملف الصوتي...');
    };

    const handleCanPlay = () => {
      setAudioIsLoading(false);
      console.log('✅ الملف الصوتي جاهز للتشغيل');
    };

    const handleError = (e) => {
      setAudioIsLoading(false);
      setAudioIsPlaying(false);
      console.error('❌ خطأ في تحميل الملف الصوتي:', e);
      console.error('🔗 الرابط:', audio.src);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentAudio]);

  // تحديث مصدر الصوت
  useEffect(() => {
    if (audioRef.current && currentAudio) {
      audioRef.current.src = currentAudio;
      audioRef.current.volume = audioVolume;
    }
  }, [currentAudio, audioVolume]);

  const formatAudioTime = (time) => {
    if (!time || isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAudioPlayPause = async (event) => {
    console.log('🚀 دخلت دالة handleAudioPlayPause');

    // منع التوجيه لصفحات أخرى والـ reload
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('🎵 ===== تم الضغط على زر التشغيل الصوتي =====');
    console.log('🔗 رابط الصوت (من ملف السورة المخصص):', currentAudio);
    console.log('🎤 القارئ المختار:', selectedReciter?.reciter?.ar);
    console.log('📖 السورة المختارة:', selectedSurah?.name?.ar);
    console.log('📁 مصدر البيانات: ملفات /json/audio/ المخصصة');
    console.log('🎛️ حالة المشغل الحالية - audioIsPlaying:', audioIsPlaying);
    console.log('⏳ حالة التحميل - audioIsLoading:', audioIsLoading);

    if (!audioRef.current) {
      console.log('❌ عنصر الصوت غير موجود');
      return false;
    }

    if (!currentAudio) {
      console.log('❌ لا يوجد رابط صوتي - تأكد من اختيار القارئ والسورة');
      return false;
    }

    if (!selectedReciter || !selectedSurah) {
      console.log('❌ لم يتم اختيار القارئ أو السورة بعد');
      return false;
    }

    try {
      if (audioIsPlaying) {
        console.log('⏸️ إيقاف التشغيل الصوتي');
        audioRef.current.pause();
        setAudioIsPlaying(false);
      } else {
        console.log('▶️ بدء التشغيل الصوتي...');
        console.log('🔗 محاولة تشغيل:', currentAudio);
        setAudioIsLoading(true);

        await audioRef.current.play();
        setAudioIsPlaying(true);
        setAudioIsLoading(false);
        console.log('✅ تم بدء التشغيل الصوتي بنجاح');
      }
    } catch (error) {
      console.error('❌ خطأ في التشغيل الصوتي:', error);
      console.error('🔗 الرابط المستخدم:', currentAudio);
      setAudioIsLoading(false);
      setAudioIsPlaying(false);
    }

    return false;

    return false; // منع أي إجراء إضافي
  };

  const handleAudioSeek = (event, newValue) => {
    if (audioRef.current && audioDuration > 0) {
      const newTime = (newValue / 100) * audioDuration;
      audioRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
    }
  };

  const handleAudioVolumeChange = (event, newValue) => {
    const newVolume = newValue / 100;
    setAudioVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setAudioIsMuted(false);
    }
  };

  const toggleAudioMute = () => {
    if (audioRef.current) {
      if (audioIsMuted) {
        audioRef.current.volume = audioVolume;
        setAudioIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setAudioIsMuted(true);
      }
    }
  };

  const currentSurah = surahs.find(s => s.number === surahNumber);
  const currentReciter = reciters.find(r => r.id === reciterId);

  return (
    <Box
      component="div"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        width: '500px',
        height: '60px',
        bgcolor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        px: 1,
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        backdropFilter: 'blur(10px)',
        borderRadius: '25px',
        border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(0, 0, 0, 0.6)'
          : '0 8px 32px rgba(0, 0, 0, 0.15)'
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔄 تم النقر على المشغل - منع التداخل');
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <audio ref={audioRef} preload="none" />

      {/* زر التشغيل */}
      <Box
        component="button"
        onClick={(e) => {
          console.log('🔥🔥🔥 تم الضغط على زر التشغيل الصوتي! 🔥🔥🔥');
          console.log('🔗 currentAudio في onClick:', currentAudio);
          console.log('🎤 selectedReciter في onClick:', selectedReciter?.reciter?.ar);
          console.log('📖 selectedSurah في onClick:', selectedSurah?.name?.ar);

          // منع جميع أنواع التداخل
          e.preventDefault();
          e.stopPropagation();

          // تنبيه صوتي للتأكد من الضغط
          console.warn('⚠️ إذا رأيت هذه الرسالة فالزر يعمل!');

          // استدعاء دالة التشغيل
          handleAudioPlayPause(e);

          return false;
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        disabled={!currentAudio}
        type="button"
        sx={{
          bgcolor: 'tomato',
          color: 'white',
          width: 40,
          height: 40,
          minWidth: 40,
          zIndex: 999999,
          position: 'relative',
          border: '3px solid white',
          borderRadius: '50%',
          cursor: currentAudio ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(255, 99, 71, 0.4)',
          '&:hover': {
            bgcolor: currentAudio ? '#e55a4f' : 'rgba(255, 99, 71, 0.3)',
            transform: currentAudio ? 'scale(1.1)' : 'none',
            boxShadow: currentAudio ? '0 6px 16px rgba(255, 99, 71, 0.6)' : 'none'
          },
          '&:disabled': {
            bgcolor: 'rgba(255, 99, 71, 0.3)',
            cursor: 'not-allowed',
            border: '3px solid rgba(255, 255, 255, 0.5)'
          },
          '&:focus': {
            outline: '3px solid yellow',
            outlineOffset: '3px'
          },
          '&:active': {
            transform: 'scale(0.95)'
          }
        }}
      >
        {audioIsLoading ? (
          <CircularProgress size={20} sx={{ color: 'white' }} />
        ) : audioIsPlaying ? (
          <Pause sx={{ fontSize: 22 }} />
        ) : (
          <PlayArrow sx={{ fontSize: 22 }} />
        )}
      </Box>

      {/* شريط التقدم */}
      <Box sx={{ width: 60, mx: 0.5 }}>
        <Slider
          value={audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0}
          onChange={handleAudioSeek}
          disabled={!currentAudio}
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
      {/* الوقت ورقم الصفحة */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '35px' }}>
        <Typography variant="caption" sx={{
          fontSize: '9px',
          color: isDarkMode ? '#ccc' : '#666',
          textAlign: 'center'
        }}>
          {formatAudioTime(audioCurrentTime)}
        </Typography>
        {selectedSurah && (
          <Typography variant="caption" sx={{
            fontSize: '8px',
            color: 'tomato',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ص{getSurahPage(selectedSurah.number)}
          </Typography>
        )}
      </Box>

      {/* اختيار السورة مع زر الانتقال */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={surahNumber || ''}
            onChange={(e) => handleSurahSelect(e.target.value)}
            displayEmpty
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#fafafa', // أوف وايت
                  maxHeight: 200,
                  '& .MuiMenuItem-root': {
                    color: '#000000',
                    fontSize: '11px',
                    minHeight: '32px',
                    '&:hover': {
                      bgcolor: '#f0f0f0'
                    },
                    '&.Mui-selected': {
                      bgcolor: '#e8e8e8',
                      '&:hover': {
                        bgcolor: '#e0e0e0'
                      }
                    }
                  }
                }
              }
            }}
            sx={{
              fontSize: '12px',
              height: '28px',
              bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              color: '#000000',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
              },
              '& .MuiSelect-select': {
                padding: '4px 8px',
                color: '#000000'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
              }
            }}
          >
            <MenuItem value="">السورة</MenuItem>
            {surahs.map((surah) => (
              <MenuItem
                key={surah.number}
                value={surah.number}
                onClick={() => console.log('📖 تم اختيار السورة:', surah.name.ar)}
              >
                {surah.number}. {surah.name.ar}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* زر الانتقال لصفحة السورة */}
        {surahNumber && (
          <IconButton
            onClick={() => navigateToSurahPage(surahNumber)}
            size="small"
            title="انتقل لصفحة السورة"
            sx={{
              color: 'tomato',
              width: 20,
              height: 20,
              minWidth: 20
            }}
          >
            <OpenInNew sx={{ fontSize: 10 }} />
          </IconButton>
        )}
      </Box>

      {/* اختيار القارئ */}
      <FormControl size="small" sx={{ minWidth: 90 }}>
        <Select
          value={reciterId || ''}
          onChange={(e) => handleReciterSelect(e.target.value)}
          displayEmpty
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#fafafa', // أوف وايت
                maxHeight: 200,
                '& .MuiMenuItem-root': {
                  color: '#000000',
                  fontSize: '11px',
                  minHeight: '32px',
                  '&:hover': {
                    bgcolor: '#f0f0f0'
                  },
                  '&.Mui-selected': {
                    bgcolor: '#e8e8e8',
                    '&:hover': {
                      bgcolor: '#e0e0e0'
                    }
                  }
                }
              }
            }
          }}
          sx={{
            fontSize: '12px',
            height: '28px',
            bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
            color: '#000000',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
            },
            '& .MuiSelect-select': {
              padding: '4px 8px',
              color: '#000000'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
            }
          }}
        >
          <MenuItem value="">القارئ</MenuItem>
          {reciters.map((reciter) => (
            <MenuItem
              key={reciter.id}
              value={reciter.id}
              onClick={() => console.log('🎤 تم اختيار القارئ:', reciter.reciter.ar)}
            >
              {reciter.reciter.ar}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* التحكم في الصوت */}
      <IconButton
        onClick={toggleAudioMute}
        size="small"
        sx={{
          color: 'tomato',
          width: 24,
          height: 24,
          minWidth: 24
        }}
      >
        {audioIsMuted ? <VolumeOff sx={{ fontSize: 12 }} /> : <VolumeUp sx={{ fontSize: 12 }} />}
      </IconButton>
    </Box>
  );
};

export default CompactAudioPlayer;
