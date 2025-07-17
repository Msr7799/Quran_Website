import React, { useState, useEffect, useTransition } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { CircularProgress, FormControl, InputLabel, Select, MenuItem, Box, Typography, FormHelperText } from '@mui/material';

export default function QariAudioPlayer() {
  const [isPending, startTransition] = useTransition();
  const [surah, setSurah] = useState(1);
  const [surahs, setSurahs] = useState([]);
  const [reciter, setReciter] = useState(null);
  const [reciters, setReciters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSurahsLoading, setIsSurahsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load surahs data when component mounts
  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const response = await fetch('https://quran-api-qklj.onrender.com/api/surahs');
        if (!response.ok) {
          throw new Error('Failed to load surahs data');
        }
        const data = await response.json();
        
        if (data.success && Array.isArray(data.result)) {
          // Sort surahs by number to ensure correct order
          const sortedSurahs = [...data.result].sort((a, b) => a.number - b.number);
          setSurahs(sortedSurahs);
        } else {
          throw new Error('Invalid surahs data format');
        }
      } catch (err) {
        console.error('Error loading surahs:', err);
        setError('فشل تحميل بيانات السور. يرجى المحاولة مرة أخرى لاحقاً.');
      } finally {
        setIsSurahsLoading(false);
      }
    };

    loadSurahs();
  }, []);

  // Load reciters data when component mounts or surah changes
  useEffect(() => {
    const loadReciters = async () => {
      if (surahs.length === 0) return; // Don't load reciters until surahs are loaded
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/json/audio/audio_surah_${surah}.json`);
        if (!response.ok) {
          throw new Error('Failed to load reciters data');
        }
        const data = await response.json();
        
        startTransition(() => {
          setReciters(data);
          // Set the first reciter as default if not set
          if (data.length > 0 && !reciter) {
            setReciter(data[0]);
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Error loading reciters:', err);
        setError('فشل تحميل بيانات القراء. يرجى المحاولة مرة أخرى لاحقاً.');
        setIsLoading(false);
      }
    };

    loadReciters();
  }, [surah, surahs]);

  const handleSurahChange = (event) => {
    const newSurah = Number(event.target.value);
    startTransition(() => {
      setSurah(newSurah);
    });
  };

  const handleReciterChange = (event) => {
    const reciterId = event.target.value;
    const selected = reciters.find(r => r.id === reciterId);
    if (selected) {
      setReciter(selected);
    }
  };

  if (isLoading && !reciter) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
        <Typography mr={2}>جاري التحميل...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={4} textAlign="center" color="error.main">
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box 
      className="audio-player-container"
      sx={{ 
        maxWidth: '100%',
        width: '100%',
        mx: 'auto',
        my: 2,
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        direction: 'rtl',
        position: 'relative',
        zIndex: 10,
        overflow: 'visible'
      }}
    >
      <Typography variant="h6" gutterBottom textAlign="center" color="primary">
        الاستماع إلى القرآن الكريم
      </Typography>
      
      <Box mb={3} sx={{ position: 'relative', zIndex: 10 }}>
        <FormControl fullWidth sx={{ mb: 2, position: 'relative', zIndex: 10 }}>
          <InputLabel id="surah-select-label">اختر السورة</InputLabel>
          <Select
            labelId="surah-select-label"
            id="surah-select"
            value={surah}
            label="اختر السورة"
            onChange={handleSurahChange}
            disabled={isLoading || isSurahsLoading}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  zIndex: 1600,
                },
              },
              // تحديد الموضع بدقة
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              disablePortal: false,
            }}
          >
            {surahs.map((surahItem) => (
              <MenuItem key={surahItem.number} value={surahItem.number}>
                {surahItem.number}. {surahItem.name.ar} ({surahItem.name.transliteration})
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {surahs[surah - 1]?.revelation_place?.ar} - {surahs[surah - 1]?.verses_count} آية
          </FormHelperText>
        </FormControl>

        <FormControl fullWidth variant="outlined" size="small" sx={{ position: 'relative', zIndex: 10 }}>
          <InputLabel id="reciter-select-label">اختر القارئ</InputLabel>
          <Select
            labelId="reciter-select-label"
            value={reciter?.id || ''}
            onChange={handleReciterChange}
            label="اختر القارئ"
            disabled={isLoading || !reciters.length}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  zIndex: 1600,
                },
              },
              // تحديد الموضع بدقة
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              disablePortal: false,
            }}
          >
            {reciters.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.reciter?.ar || `القارئ ${r.id}`}
                {r.rewaya?.ar && ` - ${r.rewaya.ar}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {reciter?.link && (
        <Box mt={3}>
          <ReactAudioPlayer
            src={reciter.link}
            controls
            style={{ width: '100%' }}
            onError={(e) => console.error('Audio loading error:', e)}
          />
          {reciter.reciter?.ar && (
            <Typography variant="body2" color="textSecondary" textAlign="center" mt={1}>
              القارئ: {reciter.reciter.ar}
              {reciter.rewaya?.ar && ` - رواية: ${reciter.rewaya.ar}`}
            </Typography>
          )}
        </Box>
      )}
      
      {isPending && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size={24} />
          <Typography mr={1}>جاري التحميل...</Typography>
        </Box>
      )}
    </Box>
  );
}
