import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, List, ListItem, ListItemText, ListItemButton, Paper, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import recitersData from '../../public/json/quranMp3.json';
import surahsData from '../../public/json/metadata.json';
import EnhancedAudioPlayer from './EnhancedAudioPlayer';

// Styled Components
const Container = styled(Box)(({ theme }) => ({
  padding: '54px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  position: 'relative',
  overflow: 'hidden',
  paddingBottom: '100px', // مساحة للفوتر
  paddingTop: '20px',
  paddingLeft: '20px',
  paddingRight: '20px',
  boxSizing: 'border-box',
  flex: 1,
  minHeight: '100vh',
  backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : '#121212',
  '@media (max-width: 768px)': {
    padding: '20px',
  },
  '@media (max-width: 880px)': {
    paddingBottom: '200px',
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: '100px',
  paddingTop: '50px',
}));

const Title = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs',
  fontSize: '2rem',
  fontWeight: 'bold',
  color: theme.palette.mode === 'light' ? '#2c3e50' : '#ecf0f1',
  marginBottom: '10px',
  textShadow: '2px 5px 7px 5px rgba(0,0,0,0.1)',
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs',
  fontSize: '0.9rem',
  color: theme.palette.mode === 'light' ? '#7f8c8d' : '#bdc3c7',
  marginBottom: '20px',
}));

const ListeningSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#1e1e1e',
  borderRadius: '20px',
  padding: '110px', // تقليل الـ padding
  marginBottom: '30px', // زيادة المسافة السفلية للمشغل
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  border: `2px solid ${theme.palette.mode === 'light' ? '#e3f2fd' : '#424242'}`,
  width: '100%',
  maxWidth: '100%',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs',
  fontSize: '1.8rem',
  fontWeight: 'bold',
  color: theme.palette.mode === 'light' ? '#1565c0' : '#64b5f6',
  marginBottom: '20px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
}));

const SelectionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '32px',
  justifyContent: 'center',
  alignItems: 'stretch', // مهم جداً لجعل الارتفاع متساوي
  width: '100%',
  maxWidth: '900px',
  margin: '0 auto 32px auto',
  padding: '0',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '100%',
  },
}));

const SelectionBox = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#23272f',
  borderRadius: '18px',
  padding: '18px 14px',
  minHeight: '520px',
  minWidth: '0',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  border: `1.5px solid ${theme.palette.mode === 'light' ? '#e3e8ef' : '#2d3748'}`,
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.08)',
  },
  // أزل أي marginBottom أو height أو width من sx عند الاستخدام!
  [theme.breakpoints.down('md')]: {
    minHeight: '200px',
    padding: '12px 8px',
  },
}));

const BoxTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'hafs',
  fontSize: '1.4rem',
  fontWeight: 'bold',
  color: theme.palette.mode === 'light' ? '#2c3e50' : '#ecf0f1',
  marginBottom: '15px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}));

// تحديث تعريف SearchField المُنمَّق
const SearchField = styled(TextField)(({ theme }) => ({
  marginBottom: '0px',
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '25px',
    backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#3c3c3c',
    width: '100%',
    color: theme.palette.mode === 'light' ? '#000000' : '#ffffff', // لون النص
    '& input': {
      padding: '8px 12px',
      fontSize: '0.875rem',
      direction: 'rtl',
      color: 'inherit',
    },
    '& fieldset': {
      borderColor: theme.palette.mode === 'light' ? '#ddd' : '#555',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'light' ? '#1976d2' : '#90caf9',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.mode === 'light' ? '#1976d2' : '#90caf9',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    opacity: 1,
  },
  slotProps: {
    inputProps: {
      sx: {
        padding: '8px 12px',
        fontSize: '0.875rem',
        direction: 'rtl',
        color: 'inherit',
        '&::placeholder': {
          color: 'inherit',
          opacity: 0.7,
        },
      },
    },
  },
}));

const ScrollableList = styled(List)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  backgroundColor: 'transparent',
  borderRadius: '10px',
  border: 'none',
  maxHeight: '220px',
  minHeight: '120px',
  width: '100%',
  padding: '0',
  margin: '0',
  '&::-webkit-scrollbar': {
    width: '7px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'light' ? '#e0e0e0' : '#333',
    borderRadius: '4px',
  },
  [theme.breakpoints.down('md')]: {
    maxHeight: '160px',
    minHeight: '80px',
  },
}));

const ListItemStyled = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'selected',
})(({ theme, selected }) => ({
  borderRadius: '8px',
  margin: '2px 4px', // تقليل الـ margin لاستغلال مساحة أكبر
  padding: '12px 16px', // إضافة padding مناسب
  backgroundColor: selected 
    ? (theme.palette.mode === 'light' ? '#e3f2fd' : '#1e3a8a') 
    : 'transparent',
  color: selected 
    ? (theme.palette.mode === 'light' ? '#1565c0' : '#90caf9') 
    : (theme.palette.mode === 'light' ? '#333' : '#fff'),
  border: selected 
    ? `2px solid ${theme.palette.mode === 'light' ? '#1976d2' : '#3b82f6'}` 
    : '2px solid transparent',
  width: 'calc(100% - 8px)', // استخدام العرض الكامل مع مراعاة الـ margin
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#404040',
    transform: 'translateX(5px)',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  transition: 'all 0.2s ease',
}));

const SelectedInfoChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#e8f5e8' : '#1b5e20',
  color: theme.palette.mode === 'light' ? '#2e7d32' : '#c8e6c9',
  fontWeight: 'bold',
  margin: '15px',
  '& .MuiChip-icon': {
    color: 'inherit',
  },
}));


export default function QuranSoundContainer() {
  const [selectedReciter, setSelectedReciter] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentSurahIndex, setCurrentSurahIndex] = useState(null);
  
  const [reciterSearch, setReciterSearch] = useState('');
  const [surahSearch, setSurahSearch] = useState('');
  
  const [filteredReciters, setFilteredReciters] = useState(recitersData);
  const [filteredSurahs, setFilteredSurahs] = useState(surahsData);

  // Filter reciters based on search
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

  // Filter surahs based on search
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

  const handleReciterSelect = (reciter) => {
    setSelectedReciter(reciter);
    setSelectedSurah(null);
    setCurrentAudio(null);
  };

  const handleSurahSelect = (surah) => {
    setSelectedSurah(surah);
    if (selectedReciter) {
      const audioUrl = `${selectedReciter.server}/${surah.number.toString().padStart(3, '0')}.mp3`;
      setCurrentAudio(audioUrl);
      setCurrentSurahIndex(surah.number - 1);
    }
  };

  const handleClosePlayer = () => {
    setCurrentAudio(null);
    setCurrentSurahIndex(null);
  };

  const handleNext = () => {
    if (currentSurahIndex < surahsData.length - 1) {
      const nextIndex = currentSurahIndex + 1;
      const nextSurah = surahsData[nextIndex];
      const nextAudioUrl = `${selectedReciter.server}/${nextSurah.number.toString().padStart(3, '0')}.mp3`;
      setCurrentSurahIndex(nextIndex);
      setCurrentAudio(nextAudioUrl);
      setSelectedSurah(nextSurah);
    }
  };

  const handlePrev = () => {
    if (currentSurahIndex > 0) {
      const prevIndex = currentSurahIndex - 1;
      const prevSurah = surahsData[prevIndex];
      const prevAudioUrl = `${selectedReciter.server}/${prevSurah.number.toString().padStart(3, '0')}.mp3`;
      setCurrentSurahIndex(prevIndex);
      setCurrentAudio(prevAudioUrl);
      setSelectedSurah(prevSurah);
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

  return (
    <Container>
      <HeaderSection>
        <Title>استماع القرآن الكريم</Title>
        <Subtitle>اختر قارئاً وسورة للاستماع إلى تلاوة القرآن الكريم</Subtitle>
      </HeaderSection>

      <ListeningSection>
        <SectionTitle>
          <VolumeUpIcon />
          قسم الاستماع
        </SectionTitle>
        
        {/* عرض المعلومات المختارة */}
        <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
          {selectedReciter && (
            <SelectedInfoChip 
              icon={<PersonIcon />}
              label={`القارئ: ${selectedReciter.reciter.ar}`}
            />
          )}
          {selectedSurah && (
            <SelectedInfoChip 
              icon={<BookIcon />}
              label={`السورة: ${selectedSurah.name.ar}`}
            />
          )}
        </Box>

        <SelectionContainer>
          {/* صندوق القراء */}
          <SelectionBox elevation={2}
        sx={{
            width: '90%',
            minWidth: '0',
            height: '80%',
            boxShadow: '15px 15px 30px rgba(0,0,0,0.1)',
            padding: '10px', // تقليل الـ padding
            marginBottom: '21px', // إضافة مسافة بين الصندوقين
          }}  
          >
            <BoxTitle>
              <PersonIcon />
              اختر القارئ
            </BoxTitle>
            <SearchField
              fullWidth
              placeholder="ابحث عن قارئ..."
              value={reciterSearch}
              onChange={(e) => setReciterSearch(e.target.value)}
              variant="outlined"
              size="small"
              slotProps={{
                inputProps: {
                  sx: {
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    direction: 'rtl',
                    color: 'inherit',
                    '&::placeholder': {
                      color: 'inherit',
                      opacity: 0.7,
                    },
                  },
                },
              }}
            />
            <ScrollableList
              sx={{
                direction: 'rtl !important',
                display: 'flex',
                position: 'relative',
                maxHeight: '315px',
                width: '90%',
                height: '90%',
                top: '125px',
                minWidth: '100px',
                border: '3px solid green',
              padding: '0',
              margin: '0',
              '& .MuiListItemButton-root': {
                padding: '5px 20px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                }
              },
              '& .MuiListItemText-root': {
                margin: '5px 0',
                padding: '0',
              },
              '& .MuiListItemText-primary': {
                fontFamily: 'hafs',
                fontSize: '.8rem',
                },

            }}
            
            >
              {filteredReciters.map((reciter) => (
                <ListItemStyled
                  key={reciter.id}
                  selected={selectedReciter?.id === reciter.id}
                  onClick={() => handleReciterSelect(reciter)}
                >
                  <ListItemText
                    primary={reciter.reciter.ar}
                    secondary={`${reciter.reciter.en} - ${reciter.rewaya.ar}`}
                    primaryTypographyProps={{
                      fontFamily: 'hafs',
                      fontSize: '1.1rem',
                      fontWeight: selectedReciter?.id === reciter.id ? 'bold' : 'normal',
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.9rem',
                      color: selectedReciter?.id === reciter.id ? 'inherit' : 'text.secondary',
                    }}
                  />
                </ListItemStyled>
              ))}
            </ScrollableList>
          </SelectionBox>

          {/* صندوق السور */}
          <SelectionBox elevation={2}
            sx={{
              width: '100%',
              minWidth: '0',
              height: '60%',
              boxShadow: '15px 15px 30px rgba(0,0,0,0.1)',
              padding: '15px', // تقليل الـ padding
              marginBottom: '0', // إضافة مسافة بين الصندوقين
            }}
          
          
          >
            <BoxTitle>
              <BookIcon />
              اختر السورة
            </BoxTitle>
            <SearchField
              fullWidth
              placeholder="ابحث عن سورة..."
              value={surahSearch}
              onChange={(e) => setSurahSearch(e.target.value)}
              variant="outlined"
              size="small"
            />
            <ScrollableList
            sx={{
              direction: 'rtl !important',
              display: 'flex',
              maxHeight: '320px',
              position: 'relative',
              width: '90%',
              height: '60%',
              top: '110px',
              border: '3px solid green',
              padding: '15px',
              margin: '15px 0',
              '& .MuiListItemButton-root': {
                padding: '15px 60px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                }
              },
              '& .MuiListItemText-root': {
                margin: '1px 0',
                },
              '& .MuiListItemText-primary': {
                fontFamily: 'hafs',
                fontSize: '.9rem',
                },

            }
            }
              >
              {filteredSurahs.map((surah) => (
                <ListItemStyled
                  key={surah.number}
                  selected={selectedSurah?.number === surah.number}
                  onClick={() => handleSurahSelect(surah)}
                  disabled={!selectedReciter}
                >
                  <ListItemText
                    primary={`${surah.number}. ${surah.name.ar}`}
                    secondary={surah.name.en}
                    primaryTypographyProps={{
                      fontFamily: 'hafs',
                      fontSize: '.7rem',
                      fontWeight: selectedSurah?.number === surah.number ? 'bold' : 'normal',
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.9rem',
                      color: selectedSurah?.number === surah.number ? 'inherit' : 'text.secondary',
                    }}
                  />
                </ListItemStyled>
              ))}
            </ScrollableList>
          </SelectionBox>
        </SelectionContainer>

        {!selectedReciter && (
          <Box sx={{ textAlign: 'center', marginTop: '20px', padding: '20px' }}>
            <Typography variant="body1" color="text.secondary">
              الرجاء اختيار قارئ أولاً لتفعيل قائمة السور
            </Typography>
          </Box>
        )}
      </ListeningSection>

      {/* مشغل الصوت المحسن - تم نقله فوق الفوتر */}
      {currentAudio && (
        <EnhancedAudioPlayer
          src={currentAudio}
          onClose={handleClosePlayer}
          onNext={handleNext}
          onPrev={handlePrev}
          prevSurah={getPrevSurah()}
          nextSurah={getNextSurah()}
          currentSurah={selectedSurah?.name?.ar}
          reciterName={selectedReciter?.reciter?.ar}
        />
      )}
    </Container>
  );
}
