// src/components/QuranSoundContainer.jsx - مع إصلاح التوقيت وموضع الآيات

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, List, ListItem, ListItemText, ListItemButton, Paper, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import recitersData from '../../public/json/quranMp3.json';
import surahsData from '../../public/json/metadata.json';
import EnhancedAudioPlayer from './EnhancedAudioPlayer';
import VerseDisplay from './VerseDisplay';

// Styled Components
const Container = styled(Box)(({ theme }) => ({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  overflow: 'hidden',
  paddingBottom: '180px',
  paddingTop: '20px',
  boxSizing: 'border-box',
  minHeight: '100vh',
  backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : '#121212',
  '@media (max-width: 768px)': {
    padding: '15px',
    paddingTop: '15px',
    paddingBottom: '200px',
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: '30px',
  paddingTop: '10px',
}));

const Title = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs',
  fontSize: '2rem',
  fontWeight: 'bold',
  color: theme.palette.mode === 'light' ? '#2c3e50' : '#ecf0f1',
  marginBottom: '10px',
  textShadow: '2px 5px 7px 5px rgba(0,0,0,0.1)',
  '@media (max-width: 768px)': {
    fontSize: '1.7rem',
  },
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs',
  fontSize: '0.9rem',
  color: theme.palette.mode === 'light' ? '#7f8c8d' : '#bdc3c7',
  marginBottom: '20px',
  '@media (max-width: 768px)': {
    fontSize: '0.8rem',
  },
}));

// حاوية الآيات - موضع ثابت بين العنوان والقوائم - محسنة مع z-index
const VerseDisplayContainer = styled(Box)(({ theme }) => ({
width: '100%',
minHeight: '350px', // مساحة أكبر للآيات الطويلة والتفسير
maxHeight: 'none', // لا يوجد حد أقصى
marginTop: '30px',
marginBottom: '40px',
position: 'relative',
right: '70%',
zIndex: 10000,
top: '50%',

transform: 'translateX(50%)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
overflow: 'visible',
backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(30, 30, 30, 0.4)',
borderRadius: '20px',
border: `2px dashed ${theme.palette.mode === 'light' ? '#e0e0e0' : '#424242'}`,
transition: 'all 0.3s ease',
boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
// لا يوجد أي تأثير أو حركة عند التحويم
'@media (max-width: 768px)': {
  minHeight: '250px',
  marginTop: '20px',
  marginBottom: '30px',
  
},
}));

const ListeningSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#1e1e1e',
  borderRadius: '20px',
  padding: '30px',
  marginBottom: '30px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  border: `2px solid ${theme.palette.mode === 'light' ? '#e3f2fd' : '#424242'}`,
  width: '100%',
  maxWidth: '100%',
  '@media (max-width: 768px)': {
    padding: '20px',
    borderRadius: '15px',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: theme.palette.mode === 'light' ? '#2c3e50' : '#ecf0f1',
  marginBottom: '20px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  '@media (max-width: 768px)': {
    fontSize: '1.5rem',
  },
}));

const SelectionContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '30px',
  marginBottom: '30px',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
    gap: '20px',
  },
}));

const SelectionBox = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '15px',
  backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#2a2a2a',
  border: `1px solid ${theme.palette.mode === 'light' ? '#e0e0e0' : '#404040'}`,
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  '@media (max-width: 768px)': {
    height: '400px',
  },
}));

const SectionSubTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  color: theme.palette.mode === 'light' ? '#2c3e50' : '#ecf0f1',
  marginBottom: '15px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}));

const SearchField = styled(TextField)(({ theme }) => ({
  marginBottom: '15px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#333333',
    fontFamily: 'hafs',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'hafs',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const ScrollableList = styled(List)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.mode === 'light' ? '#f1f1f1' : '#424242',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'light' ? '#c1c1c1' : '#757575',
    borderRadius: '10px',
    '&:hover': {
      background: theme.palette.mode === 'light' ? '#a8a8a8' : '#616161',
    },
  },
}));

const ListItemStyled = styled(ListItemButton)(({ theme, selected }) => ({
  borderRadius: '10px',
  marginBottom: '8px',
  backgroundColor: selected ? 
    (theme.palette.mode === 'light' ? '#e3f2fd' : '#1976d2') : 
    'transparent',
  '&:hover': {
    backgroundColor: selected ? 
      (theme.palette.mode === 'light' ? '#bbdefb' : '#1565c0') : 
      (theme.palette.mode === 'light' ? '#f5f5f5' : '#333333'),
  },
  border: selected ? 
    `2px solid ${theme.palette.mode === 'light' ? '#2196f3' : '#90caf9'}` : 
    'none',
  transition: 'all 0.2s ease',
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#e8f5e8' : '#1b5e20',
  color: theme.palette.mode === 'light' ? '#2e7d32' : '#c8e6c9',
  fontWeight: 'bold',
  margin: '8px',
  fontFamily: 'hafs',
  '& .MuiChip-icon': {
    color: 'inherit',
  },
  '& .MuiChip-label': {
    direction: 'rtl',
  },
  '@media (max-width: 768px)': {
    margin: '6px',
    fontSize: '0.8rem',
  },
}));

const TimingInfo = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#f0f8ff' : '#1a2332',
  borderRadius: '12px',
  padding: '16px',
  marginTop: '16px',
  border: `1px solid ${theme.palette.mode === 'light' ? '#b3d9ff' : '#2d3748'}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}));

export default function QuranSoundContainer() {
  // الحالات الأساسية
  const [selectedReciter, setSelectedReciter] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentSurahIndex, setCurrentSurahIndex] = useState(null);
  
  const [reciterSearch, setReciterSearch] = useState('');
  const [surahSearch, setSurahSearch] = useState('');
  
  const [filteredReciters, setFilteredReciters] = useState(recitersData);
  const [filteredSurahs, setFilteredSurahs] = useState(surahsData);

  // الحالات الجديدة لنظام التوقيت المحلي
  const [versesTimingData, setVersesTimingData] = useState([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(-1);
  const [showVerse, setShowVerse] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [timingAvailable, setTimingAvailable] = useState(false);
  
  // مرجع للمشغل الصوتي
  const audioRef = useRef(null);
  const verseTimeoutRef = useRef(null);

  // جميع القراء يدعمون التوقيت الآن من خلال API

  // فلترة القراء
  useEffect(() => {
    if (reciterSearch.trim() === '') {
      setFilteredReciters(recitersData);
    } else {
      const filtered = recitersData.filter(reciter =>
        reciter.reciter.ar.toLowerCase().includes(reciterSearch.toLowerCase()) ||
        reciter.reciter.en.toLowerCase().includes(reciterSearch.toLowerCase())
      );
      setFilteredReciters(filtered);
    }
  }, [reciterSearch]);

  // فلترة السور
  useEffect(() => {
    if (surahSearch.trim() === '') {
      setFilteredSurahs(surahsData);
    } else {
      const filtered = surahsData.filter(surah =>
        surah.name.ar.toLowerCase().includes(surahSearch.toLowerCase()) ||
        surah.name.en.toLowerCase().includes(surahSearch.toLowerCase())
      );
      setFilteredSurahs(filtered);
    }
  }, [surahSearch]);

  // دالة جلب بيانات التوقيت من API
  const fetchTimingData = async (surahNumber, reciterId) => {
    try {
      console.log(`🎵 جلب توقيتات السورة ${surahNumber} للقارئ ${reciterId}`);

      const response = await fetch(`https://mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${reciterId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const timingData = await response.json();

      if (!Array.isArray(timingData) || timingData.length === 0) {
        console.error('بيانات التوقيت غير صحيحة:', timingData);
        setTimingAvailable(false);
        return;
      }

      console.log(`✅ تم جلب ${timingData.length} توقيت للسورة ${surahNumber}`);

      // تحويل بيانات API إلى التنسيق المطلوب
      const verses = timingData
        .filter(timing => timing.ayah > 0) // تجاهل الآية 0 (البسملة)
        .map(timing => ({
          verse_number: timing.ayah,
          start_time: timing.start_time / 1000, // تحويل من ميلي ثانية إلى ثواني
          end_time: timing.end_time / 1000,
          duration: (timing.end_time - timing.start_time) / 1000,
          polygon: timing.polygon,
          x: timing.x,
          y: timing.y,
          page: timing.page
        }))
        .sort((a, b) => a.verse_number - b.verse_number);

      setVersesTimingData(verses);

      // حساب المدة الكلية
      const lastVerse = verses[verses.length - 1];
      const totalDuration = lastVerse ? lastVerse.end_time : 0;
      setTotalDuration(totalDuration);

      setTimingAvailable(true);

      console.log('✅ تم جلب بيانات التوقيت من API بنجاح:', {
        surah: surahNumber,
        reciter: reciterId,
        verses_count: verses.length,
        total_duration: totalDuration,
        first_verse: verses[0],
        last_verse: verses[verses.length - 1]
      });
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات التوقيت من API:', error);
      setTimingAvailable(false);
      setVersesTimingData([]);
    }
  };

  // تحديث الآية الحالية - منطق محسن مع عرض تدريجي
  const updateCurrentVerse = (currentTime) => {
    if (versesTimingData.length === 0 || !timingAvailable) return;

    // إلغاء أي timeout سابق
    if (verseTimeoutRef.current) {
      clearTimeout(verseTimeoutRef.current);
    }

    // البحث عن الآية الحالية
    let foundVerse = false;
    for (let i = 0; i < versesTimingData.length; i++) {
      const verse = versesTimingData[i];
      
      if (currentTime >= verse.start_time && currentTime < verse.end_time) {
        if (currentVerseIndex !== i) {
          console.log(`الانتقال إلى الآية ${verse.verse_number} في التوقيت ${currentTime.toFixed(2)}s (مدة: ${verse.duration.toFixed(2)}s)`);
          setCurrentVerseIndex(i);
          setShowVerse(true);
          
          // حساب مدة العرض بناءً على طول الآية
          const verseDuration = verse.duration;
          let displayDuration;
          
          if (verseDuration <= 3) {
            // آيات قصيرة: عرض لمدة 80% من الوقت
            displayDuration = Math.max(verseDuration * 0.8, 2) * 1000;
          } else if (verseDuration <= 8) {
            // آيات متوسطة: عرض لمدة 70% من الوقت
            displayDuration = Math.max(verseDuration * 0.7, 4) * 1000;
          } else {
            // آيات طويلة: عرض لمدة 60% من الوقت مع حد أقصى 12 ثانية
            displayDuration = Math.min(Math.max(verseDuration * 0.6, 6), 12) * 1000;
          }
          
          console.log(`عرض الآية ${verse.verse_number} لمدة ${displayDuration / 1000}s من أصل ${verseDuration}s`);
          
          // إخفاء الآية بعد المدة المحسوبة
          verseTimeoutRef.current = setTimeout(() => {
            setShowVerse(false);
          }, displayDuration);
        }
        foundVerse = true;
        break;
      }
    }

    // إذا لم نجد آية (ربما نحن في البسملة أو في نهاية السورة)
    if (!foundVerse) {
      if (currentTime < (versesTimingData[0]?.start_time || 0)) {
        // نحن في البسملة
        setCurrentVerseIndex(-1);
        setShowVerse(false);
      } else if (currentTime >= (versesTimingData[versesTimingData.length - 1]?.end_time || 0)) {
        // انتهت السورة
        setCurrentVerseIndex(versesTimingData.length - 1);
        setShowVerse(false);
      }
    }
  };

  // معالجة تحديث الوقت من المشغل الصوتي
  const handleTimeUpdate = (currentTime) => {
    setCurrentTime(currentTime);
    updateCurrentVerse(currentTime);
  };

  // معالجة اختيار القارئ
  const handleReciterSelect = (reciter) => {
    setSelectedReciter(reciter);
    console.log('تم اختيار القارئ:', reciter.reciter.ar);
  };

  // معالجة اختيار السورة وتشغيل الصوت
  const handleSurahSelect = (surah) => {
    if (!selectedReciter) {
      alert('يرجى اختيار القارئ أولاً');
      return;
    }

    setSelectedSurah(surah);
    setCurrentSurahIndex(surah.number - 1);
    
    // بناء رابط الصوت
    const audioUrl = `${selectedReciter.server}/${String(surah.number).padStart(3, '0')}.mp3`;
    setCurrentAudio(audioUrl);
    
    // إعادة تعيين حالة الآيات
    setShowVerse(false);
    setCurrentVerseIndex(-1);
    
    console.log('تم اختيار السورة:', surah.name.ar);
    console.log('رابط الصوت:', audioUrl);

    // جلب بيانات التوقيت من API
    fetchTimingData(surah.number, selectedReciter.id);
  };

  const handleClosePlayer = () => {
    setCurrentAudio(null);
    setCurrentSurahIndex(null);
    setShowVerse(false);
    setIsPlaying(false);
    setVersesTimingData([]);
    setTimingAvailable(false);
    setCurrentVerseIndex(-1);
    
    // إلغاء أي timeout
    if (verseTimeoutRef.current) {
      clearTimeout(verseTimeoutRef.current);
    }
  };

  const handleNext = () => {
    if (currentSurahIndex < surahsData.length - 1) {
      const nextIndex = currentSurahIndex + 1;
      const nextSurah = surahsData[nextIndex];
      handleSurahSelect(nextSurah);
    }
  };

  const handlePrev = () => {
    if (currentSurahIndex > 0) {
      const prevIndex = currentSurahIndex - 1;
      const prevSurah = surahsData[prevIndex];
      handleSurahSelect(prevSurah);
    }
  };

  const handleTogglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const getPrevSurah = () => {
    if (currentSurahIndex > 0) {
      return surahsData[currentSurahIndex - 1]?.name.ar || null;
    }
    return null;
  };

  const getNextSurah = () => {
    if (currentSurahIndex < surahsData.length - 1) {
      return surahsData[currentSurahIndex + 1]?.name.ar || null;
    }
    return null;
  };

  // الحصول على رقم الآية الحالية
  const getCurrentVerseNumber = () => {
    if (versesTimingData.length > 0 && currentVerseIndex >= 0 && currentVerseIndex < versesTimingData.length) {
      return versesTimingData[currentVerseIndex]?.verse_number || 1;
    }
    return 1;
  };

  // تنظيف عند unmount
  useEffect(() => {
    return () => {
      if (verseTimeoutRef.current) {
        clearTimeout(verseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Container>
      {/* العنوان الرئيسي */}
      <HeaderSection>
        <Title>
          🎧 استماع القرآن الكريم 🎧
        </Title>
        <Subtitle>
          اختر قارئاً مفضلاً وسورة للاستماع بجودة عالية
        </Subtitle>
      </HeaderSection>

      {/* قسم الاختيار */}
      <ListeningSection>
        <SectionTitle>
          <VolumeUpIcon sx={{ fontSize: '2rem' }} />
          اختر القارئ والسورة
        </SectionTitle>

        <SelectionContainer>
          {/* قائمة القراء */}
          <SelectionBox>
            <SectionSubTitle>
              <PersonIcon />
              اختر القارئ
            </SectionSubTitle>
            <SearchField
              label="البحث في القراء"
              variant="outlined"
              value={reciterSearch}
              onChange={(e) => setReciterSearch(e.target.value)}
              size="small"
            />
            <ScrollableList>
              {filteredReciters.map((reciter) => (
                <ListItemStyled
                  key={reciter.id}
                  selected={selectedReciter?.id === reciter.id}
                  onClick={() => handleReciterSelect(reciter)}
                >
                  <ListItemText
                    primary={reciter.reciter.ar}
                    secondary={reciter.reciter.en}
                    primaryTypographyProps={{
                      fontFamily: 'hafs',
                      fontSize: '1rem',
                      fontWeight: selectedReciter?.id === reciter.id ? 'bold' : 'normal',
                      textAlign: 'right',
                      direction: 'rtl',
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.85rem',
                      color: selectedReciter?.id === reciter.id ? 'inherit' : 'text.secondary',
                      textAlign: 'right',
                      direction: 'rtl',
                    }}
                  />
                  <StatusChip
                    icon={<AccessTimeIcon />}
                    label="مرتل"
                                      size="small"
                    variant="filled"
                  />
                </ListItemStyled>
              ))}
            </ScrollableList>
          </SelectionBox>

          {/* قائمة السور */}
          <SelectionBox>
            <SectionSubTitle>
              <BookIcon />
              اختر السورة
            </SectionSubTitle>
            <SearchField
              label="البحث في السور"
              variant="outlined"
              value={surahSearch}
              onChange={(e) => setSurahSearch(e.target.value)}
              size="small"
            />
            <ScrollableList>
              {filteredSurahs.map((surah) => (
                <ListItemStyled
                  key={surah.number}
                  selected={selectedSurah?.number === surah.number}
                  onClick={() => handleSurahSelect(surah)}
                >
                  <ListItemText
                    primary={`${surah.number}. ${surah.name.ar}`}
                    secondary={`${surah.name.en} - ${surah.numberOfAyahs} آية`}
                    primaryTypographyProps={{
                      fontFamily: 'hafs',
                      fontSize: '1rem',
                      fontWeight: selectedSurah?.number === surah.number ? 'bold' : 'normal',
                      textAlign: 'right',
                      direction: 'rtl',
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.85rem',
                      color: selectedSurah?.number === surah.number ? 'inherit' : 'text.secondary',
                      textAlign: 'right',
                      direction: 'rtl',
                    }}
                  />
                </ListItemStyled>
              ))}
            </ScrollableList>
          </SelectionBox>
        </SelectionContainer>

        {/* قسم معلومات التوقيت المحسنة - يظهر عند توفر التزامن */}
        {timingAvailable && versesTimingData.length > 0 && (
          <TimingInfo>
            <AccessTimeIcon color="primary" />
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'hafs',
                color: 'primary.main',
                fontWeight: 'bold'
              }}
            >
              تزامن دقيق لـ {versesTimingData.length} آية |
              المدة: {Math.floor(totalDuration / 60)}:{Math.floor(totalDuration % 60).toString().padStart(2, '0')} دقيقة
            </Typography>
          </TimingInfo>
        )}
      </ListeningSection>

      {/* حاوية الآيات - فوق المشغل الصوتي بدون أي position أو zIndex */}
      <VerseDisplayContainer>
        {currentAudio && (
          <VerseDisplay 
            isVisible={showVerse && currentVerseIndex >= 0}
            onTogglePlayPause={handleTogglePlayPause}
            isPlaying={isPlaying}
            surahNumber={selectedSurah?.number}
            verseNumber={getCurrentVerseNumber()}
            currentTime={currentTime}
            totalDuration={totalDuration}
          />
        )}
      </VerseDisplayContainer>

      {/* المشغل الصوتي المحسن - أسفل الحاوية مباشرة بدون marginTop أو position */}
      <Box sx={{ width: '80%', maxWidth: '550px', margin: '0 auto' }}>
        {currentAudio && (
          <EnhancedAudioPlayer
            ref={audioRef}
            src={currentAudio}
            surahName={selectedSurah?.name.ar}
            reciterName={selectedReciter?.reciter.ar}
            onClose={handleClosePlayer}
            onNext={handleNext}
            onPrev={handlePrev}
            onTogglePlayPause={handleTogglePlayPause}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentTime={currentTime}
            totalDuration={totalDuration}
            canGoPrev={currentSurahIndex > 0}
            canGoNext={currentSurahIndex < surahsData.length - 1}
            prevSurah={getPrevSurah()}
            nextSurah={getNextSurah()}
            currentSurah={selectedSurah?.name.ar}
            timingAvailable={timingAvailable}
            currentVerseNumber={getCurrentVerseNumber()}
            totalVerses={versesTimingData.length}
          />
        )}
      </Box>
    </Container>
  );
}
