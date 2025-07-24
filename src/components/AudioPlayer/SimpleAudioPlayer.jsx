// src/components/AudioPlayer/SimpleAudioPlayer.jsx - مشغل صوتي بسيط وخفيف

import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography, Slider, Select, MenuItem, FormControl } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, VolumeOff, Person } from '@mui/icons-material';
import { keyframes } from '@mui/material/styles';

// أنماط الحركة للتنبيه
const fadeInOut = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  15% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  85% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
`;

const SimpleAudioPlayer = ({
  surahNumber,
  reciterId = null, // تغيير القيمة الافتراضية إلى null
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
  const [showReciterAlert, setShowReciterAlert] = useState(false);
  const [showNoAudioAlert, setShowNoAudioAlert] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

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

  // بناء رابط الصوت للسورة المحددة فقط من ملفات JSON المحلية
  const getAudioUrl = async (surahNum, reciterId) => {
    // 🚫 فحص صارم للغاية - منع التحميل إذا لم يكن القارئ والسورة محددين بوضوح
    if (!reciterId || !surahNum || reciterId <= 0 || surahNum <= 0) {
      console.log('🚫 منع التحميل: بيانات غير مكتملة أو غير صحيحة');
      console.log('  القارئ:', reciterId, 'نوع:', typeof reciterId);
      console.log('  السورة:', surahNum, 'نوع:', typeof surahNum);
      return '';
    }
    
    // 🔒 فحص إضافي للتأكد من أن القيم ليست null أو undefined أو false
    if (reciterId === null || reciterId === undefined || reciterId === false ||
        surahNum === null || surahNum === undefined || surahNum === false) {
      console.log('🚫 منع التحميل: قيم null أو undefined');
      return '';
    }
    
    try {
      console.log(`🔍 البحث عن الملف الصوتي للسورة ${surahNum} والقارئ ${reciterId}`);
      
      // جلب بيانات القراء للسورة المحددة من ملف JSON المحلي
      // كل ملف audio_surah_X.json يحتوي على روابط السورة X لجميع القراء
      const response = await fetch(`/json/audio/audio_surah_${surahNum}.json`);
      
      if (!response.ok) {
        console.error(`❌ فشل في جلب ملف audio_surah_${surahNum}.json:`, response.status);
        return '';
      }
      
      const audioData = await response.json();
      console.log(`📄 تم تحميل بيانات السورة ${surahNum}، عدد القراء: ${audioData.length}`);
      
      // البحث عن القارئ المحدد في البيانات
      const reciterData = audioData.find(item => item.id === reciterId);
      
      if (reciterData && reciterData.link) {
        console.log(`🎵 ✅ تم العثور على رابط السورة ${surahNum} للقارئ ${reciterId}:`);
        console.log(`🔗 الرابط: ${reciterData.link}`);
        console.log(`👤 القارئ: ${reciterData.reciter.ar}`);
        console.log(`📖 الرواية: ${reciterData.rewaya.ar}`);
        
        return reciterData.link;
      } else {
        console.warn(`⚠️ لم يتم العثور على القارئ رقم ${reciterId} في ملف السورة ${surahNum}`);
        console.log('📋 القراء المتاحون:', audioData.map(r => `${r.id}: ${r.reciter.ar}`));
        return '';
      }
    } catch (error) {
      console.error(`❌ خطأ في جلب بيانات الصوت للسورة ${surahNum}:`, error);
      return '';
    }
  };

  // 🎯 تحديث مصدر الصوت فقط عند توفر القارئ والسورة معاً
  useEffect(() => {
    const updateAudioSource = async () => {
      // التأكد من وجود audioRef قبل استخدامه
      if (!audioRef.current) {
        console.log('⚠️ audioRef غير متاح بعد');
        return;
      }

      // إيقاف التشغيل أولاً عند تغيير السورة أو القارئ
      if (isPlaying) {
        setIsPlaying(false);
        audioRef.current.pause();
      }

      // 🔥 المنطق المحسن: فحص صارم قبل أي تحميل
      // تأكيد مزدوج من صحة البيانات ومنع التحميل المبكر
      const isValidSurah = surahNumber && typeof surahNumber === 'number' && surahNumber > 0 && surahNumber <= 114;
      const isValidReciter = reciterId && typeof reciterId === 'number' && reciterId > 0;
      
      console.log('🔍 فحص البيانات:');
      console.log('  السورة:', surahNumber, 'نوع:', typeof surahNumber, 'صحيح:', isValidSurah);
      console.log('  القارئ:', reciterId, 'نوع:', typeof reciterId, 'صحيح:', isValidReciter);
      
      if (isValidSurah && isValidReciter) {
        console.log('🎯 ✅ تم اختيار القارئ والسورة - بدء تحميل الصوت');
        console.log('  📊 القارئ رقم:', reciterId);
        console.log('  📖 السورة رقم:', surahNumber);
        console.log('  🚀 سيتم تحميل ملف السورة المحددة فقط');
        
        setIsLoading(true);
        setError(null);
        
        try {
          const audioUrl = await getAudioUrl(surahNumber, reciterId);
          
          if (audioUrl) {
            console.log('🎵 ✅ تم العثور على رابط الصوت:', audioUrl);
            
            // التأكد من وجود audioRef قبل الاستخدام
            if (!audioRef.current) {
              console.warn('⚠️ audioRef غير متاح، محاولة الانتظار...');
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            if (audioRef.current) {
              // التحقق من صحة الرابط
            const surahInUrl = audioUrl.match(/\/(\d{3})\.mp3$/)?.[1];
            const expectedSurah = surahNumber.toString().padStart(3, '0');
            
            if (surahInUrl === expectedSurah) {
              console.log('✅ تأكيد: الرابط صحيح للسورة (' + expectedSurah + ')');
            } else {
              console.warn('⚠️ تحذير: رقم السورة في الرابط غير متطابق!');
              console.warn('  المتوقع:', expectedSurah, '، الموجود:', surahInUrl);
            }
            
            // إعادة تعيين القيم
            setCurrentTime(0);
            setDuration(0);
            
            // تعيين المصدر الجديد
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            
            console.log('🎵 ✅ تم تحديث مصدر الصوت بنجاح');
            setError(null);
            } else {
              console.error('❌ audioRef غير متاح حتى بعد الانتظار');
              setError('خطأ في تحضير المشغل');
            }
          } else {
            console.error('❌ لم يتم العثور على رابط الصوت');
            setError('لم يتم العثور على الملف الصوتي');
            setShowNoAudioAlert(true);
            setTimeout(() => setShowNoAudioAlert(false), 4000);
          }
        } catch (error) {
          console.error('❌ خطأ في تحديث مصدر الصوت:', error);
          setError('خطأ في تحميل الملف الصوتي');
        }
        
        setIsLoading(false);
      } else {
        // 🔇 مسح مصدر الصوت إذا لم يكن القارئ والسورة محددين معاً
        console.log('🔇 مسح مصدر الصوت - في انتظار اختيار القارئ والسورة معاً');
        if (audioRef.current.src) {
          audioRef.current.src = '';
          audioRef.current.load();
        }
        setCurrentTime(0);
        setDuration(0);
        setError(null);
        setIsLoading(false);
        
        // رسائل توضيحية محسنة
        if (!reciterId && !surahNumber) {
          console.log('⏸️ لم يتم اختيار القارئ أو السورة بعد - لا يتم تحميل أي شيء');
        } else if (!reciterId) {
          console.log('⏸️ تم اختيار السورة (' + surahNumber + ') ولكن لم يتم اختيار القارئ بعد - لا يتم تحميل ملفات صوتية');
          console.log('🚫 منع التحميل المبكر: في انتظار اختيار القارئ');
        } else if (!surahNumber) {
          console.log('⏸️ تم اختيار القارئ (' + reciterId + ') ولكن لم يتم اختيار السورة بعد - لا يتم تحميل ملفات صوتية');
          console.log('🚫 منع التحميل المبكر: في انتظار اختيار السورة');
        } else if (surahNumber <= 0 || reciterId <= 0) {
          console.log('🚫 بيانات غير صحيحة - منع التحميل');
          console.log('  السورة:', surahNumber, '/ القارئ:', reciterId);
        }
      }
    };

    // تأخير قصير للتأكد من التزامن
    const timer = setTimeout(() => {
      updateAudioSource();
    }, 100);

    return () => clearTimeout(timer);
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

  // تشغيل/إيقاف - يتطلب اختيار القارئ والسورة معاً
  const togglePlay = async () => {
    if (!audioRef.current) return;

    // التحقق من اختيار القارئ والسورة معاً
    if (!reciterId || !surahNumber) {
      setShowReciterAlert(true);
      setTimeout(() => setShowReciterAlert(false), 4000);
      return;
    }

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
        background: 'transparent', // شفاف تماماً
        borderRadius: '0px', // بدون حواف
        boxShadow: 'none', // بدون ظلال
        minWidth: '400px',
        maxWidth: '100%',
        backdropFilter: 'none', // بدون تأثير ضبابي
        border: 'none', // بدون حدود
        position: 'relative', // للتنبيه المطلق
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
          background: 'transparent', // شفاف
          border: 'none', // بدون حدود
          boxShadow: 'none', // بدون ظلال
          color: 'lime', // لون الأيقونة أخضر
          '&:hover': {
            background: 'rgba(50, 205, 50, 0.1)', // خلفية خفيفة عند التمرير
            transform: 'translateY(-1px)',
            boxShadow: 'none'
          },
          '&:disabled': {
            opacity: 0.6,
            background: 'transparent',
            color: 'rgba(50, 205, 50, 0.5)'
          }
        }}
      >
        {isLoading ? (
          <Typography variant="caption" sx={{ fontSize: '10px', color: 'lime' }}>...</Typography>
        ) : isPlaying ? (
          <Pause sx={{ fontSize: '20px', color: 'lime' }} />
        ) : (
          <PlayArrow sx={{ fontSize: '20px', color: 'lime' }} />
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
            color: 'lime', /* لون شريط التقدم أخضر */
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              color: 'lime' /* لون المقبض أخضر */
            },
            '& .MuiSlider-track': {
              height: 4,
              color: 'lime' /* لون المسار أخضر */
            },
            '& .MuiSlider-rail': {
              height: 4,
              color: 'rgba(50, 205, 50, 0.3)' /* لون الخلفية أخضر فاتح */
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
          value={surahNumber || ''}
          onChange={(e) => onSurahChange && onSurahChange(parseInt(e.target.value))}
          displayEmpty
          sx={{
            fontSize: '10px',
            height: '32px',
            background: 'rgba(255, 255, 255, 0.95)', // خلفية بيضاء شبه شفافة
            borderRadius: '8px',
            color: 'black', /* لون النص أسود */
            border: '1px solid rgba(0, 0, 0, 0.2)',
            '& .MuiSelect-select': {
              padding: '6px 8px',
              color: 'black' /* لون النص المحدد أسود */
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none' // إزالة الحدود الافتراضية
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
                color: 'black', /* لون النص أسود */
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
          value={reciterId || ''}
          onChange={(e) => onReciterChange && onReciterChange(parseInt(e.target.value))}
          displayEmpty
          sx={{
            fontSize: '10px',
            height: '32px',
            background: 'rgba(255, 255, 255, 0.95)', // خلفية بيضاء شبه شفافة
            borderRadius: '8px',
            color: 'black', /* لون النص أسود */
            border: '1px solid rgba(0, 0, 0, 0.2)',
            '& .MuiSelect-select': {
              padding: '6px 8px',
              color: 'black' /* لون النص المحدد أسود */
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none' // إزالة الحدود الافتراضية
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
          <MenuItem value="" disabled>
            <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>
              اختر قارئاً
            </Typography>
          </MenuItem>
          {recitersData.map((reciter) => (
            <MenuItem
              key={reciter.id}
              value={reciter.id}
              sx={{
                fontSize: '12px',
                padding: '8px 12px',
                color: 'black', /* لون النص أسود */
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
        <IconButton size="small" onClick={toggleMute} sx={{ width: 28, height: 28, color: 'lime' }}>
          {isMuted || volume === 0 ?
            <VolumeOff sx={{ fontSize: '16px', color: 'lime' }} /> :
            <VolumeUp sx={{ fontSize: '16px', color: 'lime' }} />
          }
        </IconButton>
        <Slider
          value={isMuted ? 0 : volume * 100}
          onChange={handleVolumeChange}
          disabled={isMuted}
          sx={{
            width: 40,
            height: 3,
            color: 'lime', /* لون الشريط أخضر */
            '& .MuiSlider-thumb': {
              width: 8,
              height: 8,
              color: 'lime' /* لون المقبض أخضر */
            },
            '& .MuiSlider-track': {
              color: 'lime' /* لون المسار أخضر */
            },
            '& .MuiSlider-rail': {
              color: 'rgba(50, 205, 50, 0.3)' /* لون الخلفية أخضر فاتح */
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

      {/* تنبيه اختيار القارئ والسورة */}
      {showReciterAlert && (
        <Box
          sx={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 152, 0, 0.95)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            animation: `${fadeInOut} 4s ease-in-out`
          }}
        >
          {!reciterId && !surahNumber ? 'يرجى اختيار قارئ وسورة قبل التشغيل' :
           !reciterId ? 'يرجى اختيار قارئ قبل التشغيل' :
           'يرجى اختيار سورة قبل التشغيل'}
        </Box>
      )}

      {/* تنبيه عدم وجود الملف الصوتي */}
      {showNoAudioAlert && (
        <Box
          sx={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(244, 67, 54, 0.95)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            animation: `${fadeInOut} 4s ease-in-out`
          }}
        >
          لم يتم العثور على ملف صوتي لهذا القارئ
        </Box>
      )}
    </Box>
  );
};

export default SimpleAudioPlayer;
