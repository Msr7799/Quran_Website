import React, { useState, useEffect, useTransition } from 'react';
import AudioPlayerPro from 'react-audio-player-pro';
import 'react-audio-player-pro/dist/style.css';
import { 
  CircularProgress, 
  Box, 
  Typography, 
  Card,
  CardContent,
  Fade,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Collapse,
  Stack,
  Button,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PersonIcon from '@mui/icons-material/Person';
import Portal from '@mui/material/Portal';
import styles from '../styles/QuranAudioIndex.module.css';

export default function QuranAudioIndex() {
  const theme = useTheme();
  const [isPending, startTransition] = useTransition();
  const [surah, setSurah] = useState(1);
  const [surahs, setSurahs] = useState([]);
  const [reciter, setReciter] = useState(null);
  const [reciters, setReciters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSurahsLoading, setIsSurahsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [surahsExpanded, setSurahsExpanded] = useState(false);
  const [recitersExpanded, setRecitersExpanded] = useState(false);
  const [selectedSurahName, setSelectedSurahName] = useState('');
  const [selectedReciterName, setSelectedReciterName] = useState('');
  const [surahsAnchorEl, setSurahsAnchorEl] = useState(null);
  const [recitersAnchorEl, setRecitersAnchorEl] = useState(null);

  useEffect(() => {
    const loadSurahs = async () => {
      try {
        const response = await fetch('https://quran-api-qklj.onrender.com/api/surahs');
        if (!response.ok) {
          throw new Error('Failed to load surahs data');
        }
        const data = await response.json();

        if (data.success && Array.isArray(data.result)) {
          const sortedSurahs = [...data.result].sort((a, b) => a.number - b.number);
          setSurahs(sortedSurahs);
          // Set default surah name
          const defaultSurah = sortedSurahs.find(s => s.number === 1);
          if (defaultSurah) {
            setSelectedSurahName(defaultSurah.name.ar);
          }
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

  useEffect(() => {
    const loadReciters = async () => {
      if (surahs.length === 0) return;

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
          if (data.length > 0 && !reciter) {
            setReciter(data[0]);
            setSelectedReciterName(data[0].reciter?.ar || `القارئ ${data[0].id}`);
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

  const handleSurahChange = (newSurah, surahName) => {
    startTransition(() => {
      setSurah(newSurah);
      setSelectedSurahName(surahName);
      setSurahsExpanded(false);
    });
  };

  const handleReciterChange = (selectedReciter) => {
    setReciter(selectedReciter);
    setSelectedReciterName(selectedReciter.reciter?.ar || `القارئ ${selectedReciter.id}`);
    setRecitersExpanded(false);
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
    <div className={styles.audioIndexContainer}>
      <Fade in={true} timeout={800}>
        <Card className={styles.mainCard} sx={{ maxWidth: '100%', mx: 'auto', my: 2, position: 'relative' }}>
        <CardContent sx={{ p: 4 }}>
          <Box className={styles.titleSection}>
            <Typography variant="h4" className={styles.mainTitle}>
              🎧 استماع إلى القرآن الكريم
            </Typography>
            <Typography variant="body1" className={styles.subtitle}>
              اختر السورة والقارئ المفضل لديك
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
              <Button
                fullWidth
                variant="outlined"
                className={styles.selectionButton}
                onClick={() => {
                  console.log('Surah button clicked, current state:', surahsExpanded);
                  console.log('Surahs data:', surahs.length);
                  setSurahsExpanded(!surahsExpanded);
                }}
                endIcon={<ExpandMoreIcon />}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  borderColor: 'divider',
                  fontSize: '1.1rem',
                  minHeight: '56px',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'primary.main'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    height: '8px',
                    background: 'transparent'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" gap={1} className={styles.buttonContent}>
                  <Avatar className={styles.surahAvatar}>
                    {surah}
                  </Avatar>
                  <span className={styles.arabicText}>{selectedSurahName || 'اختر السورة'}</span>
                </Stack>
              </Button>
              {surahsExpanded && (
                <Box
                  className={styles.dropdownContainer}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 10000,
                    backgroundColor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: theme.shadows[8],
                    transform: 'scale(1.49)', // تعويض التحجيم 1 ÷ 0.67 = 1.49
                    transformOrigin: 'top center',
                    borderRadius: '12px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    mt: 1
                  }}
                >
                  <List dense>
                    {surahs.map(surahItem => (
                      <ListItemButton
                        key={surahItem.number}
                        onClick={() => handleSurahChange(surahItem.number, surahItem.name.ar)}
                        className={styles.listItemButton}
                      >
                        <ListItemAvatar>
                          <Avatar className={styles.surahAvatar}>{surahItem.number}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<span className={styles.listItemPrimary}>{surahItem.name.ar}</span>}
                          secondary={<span className={styles.listItemSecondary}>
                            {`${surahItem.name.transliteration} • ${surahItem.verses_count} آية`}
                          </span>}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
              <Button
                fullWidth
                variant="outlined"
                className={styles.selectionButton}
                onClick={() => setRecitersExpanded(!recitersExpanded)}
                endIcon={<ExpandMoreIcon />}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  borderColor: 'divider',
                  fontSize: '1.1rem',
                  minHeight: '56px',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" gap={1} className={styles.buttonContent}>
                  <PersonIcon className={styles.reciterIcon} />
                  <span className={styles.arabicText}>{selectedReciterName || 'اختر القارئ'}</span>
                </Stack>
              </Button>
              {recitersExpanded && (
                <Box
                  className={styles.dropdownContainer}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 10000,
                    backgroundColor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: theme.shadows[8],
                    transform: 'scale(1.49)', // تعويض التحجيم 1 ÷ 0.67 = 1.49
                    transformOrigin: 'top center',
                    borderRadius: '12px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    mt: 1
                  }}
                >
                  <List dense>
                    {reciters.map(r => (
                      <ListItemButton
                        key={r.id}
                        onClick={() => handleReciterChange(r)}
                        className={styles.listItemButton}
                      >
                        <ListItemAvatar>
                          <VolumeUpIcon className={styles.reciterIcon} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={<span className={styles.listItemPrimary}>{r.reciter?.ar || `القارئ ${r.id}`}</span>}
                          secondary={<span className={styles.listItemSecondary}>{r.rewaya?.ar ? `رواية: ${r.rewaya.ar}` : ''}</span>}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>
          </Grid>
          
          {/* مساحة إضافية للقوائم المنسدلة */}
          <Box sx={{ height: surahsExpanded || recitersExpanded ? '300px' : '20px' }} />

          {reciter?.link && (
            <Fade in={true} timeout={600}>
              <Box className={styles.audioSection}>
                <Box className={styles.audioPlayerWrapper}>
                  <AudioPlayerPro
                    audioList={[{
                      name: `${selectedSurahName} - ${selectedReciterName}`,
                      src: reciter.link,
                      singer: selectedReciterName,
                      cover: '/quran-icon.png' // يمكنك تغيير هذا لصورة مناسبة
                    }]}
                    theme="dark"
                    locale="ar_SA"
                    showMediaSession={true}
                    showPlayMode={false}
                    showReload={false}
                    showDownload={true}
                    showPlayList={false}
                    autoHiddenCover={false}
                    defaultVolume={0.8}
                    preload={true}
                    glassBg={true}
                    remember={true}
                    defaultPosition={{ bottom: 10, left: 10 }}
                    mode="full"
                    once={false}
                    autoPlay={false}
                    toggleMode={false}
                    showMiniModeCover={true}
                    showMiniProcessBar={false}
                    showProgressLoadBar={true}
                    showPlay={true}
                    showReload={false}
                    showDownload={true}
                    showPlayMode={false}
                    showThemeSwitch={false}
                    showLyric={false}
                    showMediaSession={true}
                    onAudioPlay={() => console.log('Audio is playing')}
                    onAudioPause={() => console.log('Audio is paused')}
                    onAudioEnded={() => console.log('Audio ended')}
                    onAudioError={(e) => console.error('Audio error:', e)}
                  />
                </Box>
                
                {reciter.reciter?.ar && (
                  <Box className={styles.reciterInfoCard}>
                    <Typography variant="body1" className={styles.reciterMainText}>
                      🎙️ القارئ: {reciter.reciter.ar}
                    </Typography>
                    {reciter.rewaya?.ar && (
                      <Typography variant="body2" className={styles.reciterSecondaryText}>
                        📖 رواية: {reciter.rewaya.ar}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Fade>
          )}

          {isPending && (
            <Box className={styles.loadingContainer}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body2" className={styles.loadingText}>جاري التحميل...</Typography>
            </Box>
          )}
        </CardContent>
        </Card>
      </Fade>
    </div>
  );
}

