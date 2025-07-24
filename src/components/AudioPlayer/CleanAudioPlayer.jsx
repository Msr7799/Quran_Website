// مشغل صوتي بسيط ونظيف - لا يحمل أي بيانات إلا عند اختيار القارئ والسورة معاً
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
  formatTime,
  findSurahByNumber,
  findReciterById
} from '../../utils/simpleQuranAPI';

const CleanAudioPlayer = ({ 
  initialSurahNumber = null, 
  initialReciterId = null,
  onSurahChange,
  onReciterChange 
}) => {
  // حالات البيانات الأساسية
  const [surahs, setSurahs] = useState([]);
  const [reciters, setReciters] = useState([]);
  
  // حالات الاختيار
  const [selectedSurah, setSelectedSurah] = useState(initialSurahNumber);
  const [selectedReciter, setSelectedReciter] = useState(initialReciterId);
  
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
      console.log('🔄 تحميل البيانات الأساسية...');
      
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

  // تحميل الصوت فقط عند اختيار القارئ والسورة معاً
  useEffect(() => {
    const loadAudio = async () => {
      // التحقق الصارم: يجب اختيار القارئ والسورة معاً
      if (!isValidSurahNumber(selectedSurah) || !isValidReciterId(selectedReciter)) {
        console.log('⏸️ لم يتم اختيار القارئ والسورة معاً:', {
          surah: selectedSurah,
          reciter: selectedReciter,
          surahValid: isValidSurahNumber(selectedSurah),
          reciterValid: isValidReciterId(selectedReciter)
        });
        
        // إعادة تعيين الصوت إذا كان موجود
        if (audioRef.current) {
          audioRef.current.src = '';
          setAudioUrl(null);
          setIsPlaying(false);
          setCurrentTime(0);
          setDuration(0);
        }
        
        return;
      }

      console.log('🎯 تم اختيار القارئ والسورة - بدء تحميل الصوت:', {
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
  const currentSurah = findSurahByNumber(surahs, selectedSurah);
  const currentReciter = findReciterById(reciters, selectedReciter);

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 800, 
      mx: 'auto', 
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1
    }}>
      {/* عنصر الصوت المخفي */}
      <audio ref={audioRef} preload="none" />
      
      {/* رسالة الخطأ */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* اختيار القارئ والسورة */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>اختر القارئ</InputLabel>
          <Select
            value={selectedReciter || ''}
            onChange={(e) => handleReciterSelection(e.target.value)}
            label="اختر القارئ"
          >
            <MenuItem value="">
              <em>لم يتم الاختيار</em>
            </MenuItem>
            {reciters.map((reciter) => (
              <MenuItem key={reciter.id} value={reciter.id}>
                {reciter.reciter.ar}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>اختر السورة</InputLabel>
          <Select
            value={selectedSurah || ''}
            onChange={(e) => handleSurahSelection(e.target.value)}
            label="اختر السورة"
          >
            <MenuItem value="">
              <em>لم يتم الاختيار</em>
            </MenuItem>
            {surahs.map((surah) => (
              <MenuItem key={surah.number} value={surah.number}>
                {surah.number}. {surah.name.ar}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* معلومات التشغيل الحالي */}
      {currentSurah && currentReciter && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="primary">
            {currentSurah.name.ar}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentReciter.reciter.ar} - {currentReciter.rewaya.ar}
          </Typography>
        </Box>
      )}

      {/* أزرار التحكم */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton 
          onClick={handlePlayPause} 
          disabled={!audioUrl || isLoading}
          color="primary"
          size="large"
        >
          {isLoading ? '⏳' : (isPlaying ? <Pause /> : <PlayArrow />)}
        </IconButton>

        <Box sx={{ flex: 1, mx: 2 }}>
          <Slider
            value={duration > 0 ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            disabled={!audioUrl || duration === 0}
            sx={{ color: 'primary.main' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption">
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={toggleMute} size="small">
          {isMuted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
        
        <Box sx={{ width: 100 }}>
          <Slider
            value={volume * 100}
            onChange={handleVolumeChange}
            disabled={!audioUrl}
            size="small"
          />
        </Box>
      </Box>

      {/* رسالة التوجيه */}
      {(!selectedSurah || !selectedReciter) && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {!selectedReciter && !selectedSurah 
              ? 'اختر القارئ والسورة لبدء التشغيل'
              : !selectedReciter 
                ? 'اختر القارئ لبدء التشغيل'
                : 'اختر السورة لبدء التشغيل'
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CleanAudioPlayer;
