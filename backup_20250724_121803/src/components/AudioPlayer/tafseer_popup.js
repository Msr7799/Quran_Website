// src/components/AudioPlayer/tafseer_popup.js - نافذة منبثقة للتفسير

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  MenuBook as BookIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import convertToArabicNumerals from '../../utils/convertToArabicNumerals.js';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh'
  }
}));

const ArabicText = styled(Typography)(({ theme }) => ({
  fontFamily: 'var(--font-family-arabic)',
  fontSize: '1.2rem',
  lineHeight: 1.8,
  textAlign: 'right',
  direction: 'rtl',
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2)
}));

const TafseerText = styled(Typography)(({ theme }) => ({
  fontFamily: 'var(--font-family-arabic)',
  fontSize: '1rem',
  lineHeight: 1.6,
  textAlign: 'right',
  direction: 'rtl',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  borderRadius: '8px',
  border: `1px solid ${theme.palette.divider}`
}));

/**
 * نافذة منبثقة لعرض تفسير الآيات
 */
const TafseerPopup = ({
  open,
  onClose,
  surahNumber,
  ayahNumber,
  ayahText = '',
  surahName = ''
}) => {
  const [tafseerData, setTafseerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  // جلب بيانات التفسير
  useEffect(() => {
    if (open && surahNumber && ayahNumber) {
      fetchTafseer();
    }
  }, [open, surahNumber, ayahNumber]);

  // إضافة معالج للـ Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const fetchTafseer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // محاولة جلب التفسير من مصادر متعددة
      const sources = [
        {
          name: 'تفسير الجلالين',
          url: `http://api.quran-tafseer.com/tafseer/1/${surahNumber}/${ayahNumber}`
        },
        {
          name: 'تفسير ابن كثير',
          url: `http://api.quran-tafseer.com/tafseer/2/${surahNumber}/${ayahNumber}`
        },
        {
          name: 'تفسير السعدي',
          url: `http://api.quran-tafseer.com/tafseer/3/${surahNumber}/${ayahNumber}`
        }
      ];

      const tafseerResults = [];
      
      for (const source of sources) {
        try {
          const response = await fetch(source.url);
          if (response.ok) {
            const data = await response.json();
            if (data.text) {
              tafseerResults.push({
                name: source.name,
                text: data.text
              });
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch from ${source.name}:`, err);
        }
      }

      if (tafseerResults.length > 0) {
        setTafseerData(tafseerResults);
      } else {
        setError('لم يتم العثور على تفسير لهذه الآية');
      }
      
    } catch (err) {
      setError('خطأ في جلب التفسير');
      console.error('Tafseer fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `
${surahName} - الآية ${convertToArabicNumerals(ayahNumber)}
${ayahText}

${tafseerData?.[0]?.text || ''}
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${surahName} - الآية ${convertToArabicNumerals(ayahNumber)}`,
          text: shareText
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // نسخ إلى الحافظة
      navigator.clipboard.writeText(shareText).then(() => {
        // يمكن إضافة إشعار هنا
      });
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // يمكن إضافة منطق حفظ الإشارة المرجعية هنا
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      scroll="paper"
      aria-labelledby="tafseer-dialog-title"
    >
      <DialogTitle id="tafseer-dialog-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <BookIcon color="primary" />
            <Typography variant="h6">
              تفسير {surahName} - الآية {convertToArabicNumerals(ayahNumber)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* نص الآية */}
        {ayahText && (
          <Box mb={3}>
            <Chip 
              label="نص الآية" 
              color="primary" 
              variant="outlined" 
              sx={{ mb: 2 }}
            />
            <ArabicText>
              {ayahText}
            </ArabicText>
            <Divider />
          </Box>
        )}

        {/* محتوى التفسير */}
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>جاري تحميل التفسير...</Typography>
          </Box>
        )}

        {error && (
          <Box textAlign="center" py={4}>
            <Typography color="error">{error}</Typography>
            <Button onClick={fetchTafseer} sx={{ mt: 2 }}>
              إعادة المحاولة
            </Button>
          </Box>
        )}

        {tafseerData && tafseerData.length > 0 && (
          <Box>
            {tafseerData.map((tafseer, index) => (
              <Box key={index} mb={3}>
                <Chip 
                  label={tafseer.name} 
                  color="secondary" 
                  variant="outlined" 
                  sx={{ mb: 2 }}
                />
                <TafseerText>
                  {tafseer.text}
                </TafseerText>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleBookmark}
          startIcon={<BookmarkIcon />}
          color={bookmarked ? 'primary' : 'inherit'}
        >
          {bookmarked ? 'محفوظ' : 'حفظ'}
        </Button>
        
        <Button
          onClick={handleShare}
          startIcon={<ShareIcon />}
          disabled={!tafseerData}
        >
          مشاركة
        </Button>
        
        <Button onClick={onClose} variant="contained">
          إغلاق
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default TafseerPopup;
