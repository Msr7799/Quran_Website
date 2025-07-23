// Hook للتعامل مع بيانات القرآن من mp3quran.net
import { useState, useEffect, useCallback } from 'react';
import {
  fetchReads,
  fetchSurahs as apiFetchSurahs,
  fetchAyatTiming as apiFetchAyatTiming,
  cleanSurahData,
  findCurrentAyah,
  getAudioUrl
} from '../utils/quranAPI';

export const useQuranAPI = () => {
  const [reads, setReads] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [ayatTiming, setAyatTiming] = useState([]);
  const [loading, setLoading] = useState({
    reads: false,
    surahs: false,
    timing: false
  });
  const [error, setError] = useState({
    reads: null,
    surahs: null,
    timing: null
  });

  // جلب القراء
  const fetchReadsData = useCallback(async () => {
    setLoading(prev => ({ ...prev, reads: true }));
    setError(prev => ({ ...prev, reads: null }));

    try {
      const data = await fetchReads();
      setReads(data);
    } catch (err) {
      setError(prev => ({ ...prev, reads: err.message }));
      console.error('Error fetching reads:', err);
    } finally {
      setLoading(prev => ({ ...prev, reads: false }));
    }
  }, []);

  // جلب السور لقارئ محدد
  const fetchSurahsData = useCallback(async (readId) => {
    if (!readId) return;

    setLoading(prev => ({ ...prev, surahs: true }));
    setError(prev => ({ ...prev, surahs: null }));

    try {
      const data = await apiFetchSurahs(readId);
      const cleanedData = cleanSurahData(data);
      setSurahs(cleanedData);
    } catch (err) {
      setError(prev => ({ ...prev, surahs: err.message }));
      console.error('Error fetching surahs:', err);
    } finally {
      setLoading(prev => ({ ...prev, surahs: false }));
    }
  }, []);

  // جلب توقيتات الآيات
  const fetchAyatTimingData = useCallback(async (surahId, readId) => {
    if (!surahId || !readId) return;

    setLoading(prev => ({ ...prev, timing: true }));
    setError(prev => ({ ...prev, timing: null }));

    try {
      const data = await apiFetchAyatTiming(surahId, readId);
      setAyatTiming(data);
    } catch (err) {
      setError(prev => ({ ...prev, timing: err.message }));
      console.error('Error fetching ayat timing:', err);
    } finally {
      setLoading(prev => ({ ...prev, timing: false }));
    }
  }, []);

  // تحميل القراء عند بداية التشغيل
  useEffect(() => {
    fetchReadsData();
  }, [fetchReadsData]);

  return {
    // البيانات
    reads,
    surahs,
    ayatTiming,
    
    // حالات التحميل
    loading,
    
    // الأخطاء
    error,
    
    // الوظائف
    fetchReads: fetchReadsData,
    fetchSurahs: fetchSurahsData,
    fetchAyatTiming: fetchAyatTimingData,
    
    // وظائف مساعدة
    clearSurahs: () => setSurahs([]),
    clearTiming: () => setAyatTiming([]),
    clearErrors: () => setError({ reads: null, surahs: null, timing: null })
  };
};

// Hook للحصول على معلومات الآية الحالية حسب الوقت
export const useCurrentAyah = (ayatTiming, currentTime) => {
  const [currentAyah, setCurrentAyah] = useState(null);

  useEffect(() => {
    if (!ayatTiming || ayatTiming.length === 0 || currentTime === null) {
      setCurrentAyah(null);
      return;
    }

    // استخدام دالة البحث من utility
    const currentTimeMs = currentTime * 1000;
    const ayah = findCurrentAyah(ayatTiming, currentTimeMs);
    setCurrentAyah(ayah);
  }, [ayatTiming, currentTime]);

  return currentAyah;
};

// Hook لإدارة مشغل الصوت
export const useAudioPlayer = () => {
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // إنشاء مشغل صوت جديد
  const createAudio = useCallback((src) => {
    if (audio) {
      audio.pause();
      audio.src = '';
    }

    const newAudio = new Audio(src);
    
    // إعداد event listeners
    newAudio.addEventListener('loadedmetadata', () => {
      setDuration(newAudio.duration);
    });

    newAudio.addEventListener('timeupdate', () => {
      setCurrentTime(newAudio.currentTime);
    });

    newAudio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    newAudio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    });

    newAudio.volume = volume;
    setAudio(newAudio);
    
    return newAudio;
  }, [audio, volume]);

  // تشغيل/إيقاف الصوت
  const togglePlay = useCallback(() => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Error playing audio:', err);
      });
    }
  }, [audio, isPlaying]);

  // إيقاف الصوت
  const stop = useCallback(() => {
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, [audio]);

  // تغيير الوقت
  const seek = useCallback((time) => {
    if (!audio) return;
    
    audio.currentTime = time;
    setCurrentTime(time);
  }, [audio]);

  // تغيير مستوى الصوت
  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  }, [audio]);

  // تنظيف الموارد
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  return {
    // الحالة
    isPlaying,
    currentTime,
    duration,
    volume,
    
    // الوظائف
    createAudio,
    togglePlay,
    stop,
    seek,
    changeVolume
  };
};
