// src/components/Navigation/MobileSurahSelector.jsx - مكون اختيار السورة للموبايل
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Autocomplete,
  TextField,
  Paper,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { MenuBook } from '@mui/icons-material';

// استيراد البيانات
import surahsData from '../../../public/json/metadata.json';
import { getSurahPage } from '../../utils/surahPageMapping';

const MobileSurahSelector = ({ 
  currentPage = 1,
  isDarkMode = false,
  onPageChange,
  isFullscreen = false
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [surahInput, setSurahInput] = useState('');

  // إعداد قائمة السور للبحث
  const surahOptions = surahsData.map(surah => ({
    id: surah.number,
    label: surah.name.ar,
    transliteration: surah.name.transliteration,
    page: getSurahPage(surah.number)
  }));

  // دالة التنقل إلى صفحة معينة
  const navigateToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= 604) {
      if (onPageChange) {
        onPageChange(pageNumber);
      } else {
        router.push(`/quran-pages/${pageNumber}`);
      }
    }
  };

  // معالجة اختيار السورة
  const handleSurahSelect = (event, selectedSurah) => {
    if (selectedSurah) {
      const pageNumber = selectedSurah.page;
      navigateToPage(pageNumber);
      setSurahInput('');
    }
  };

  // معالجة تغيير نص البحث للسورة
  const handleSurahInputChange = (event, newValue) => {
    setSurahInput(newValue);
  };

  // إخفاء المكون إذا لم يكن في الموبايل أو في وضع الشاشة الكاملة
  if (!isMobile || isFullscreen) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1100,
        width: '90%',
        maxWidth: '300px'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 1,
          bgcolor: isDarkMode ? 'grey.800' : 'white',
          borderRadius: 2,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        <Autocomplete
          options={surahOptions}
          getOptionLabel={(option) => option.label}
          onChange={handleSurahSelect}
          onInputChange={handleSurahInputChange}
          value={null}
          inputValue={surahInput}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="اختر السورة للانتقال إليها"
              variant="outlined"
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <MenuBook 
                    sx={{ 
                      color: isDarkMode ? 'grey.400' : 'grey.600',
                      mr: 1,
                      fontSize: '1.2rem'
                    }} 
                  />
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDarkMode ? 'grey.700' : 'grey.50',
                  '& fieldset': {
                    borderColor: 'transparent'
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? 'grey.500' : 'grey.400'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main'
                  }
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? 'white' : 'inherit',
                  fontSize: '0.9rem',
                  textAlign: 'center'
                },
                '& .MuiInputBase-input::placeholder': {
                  color: isDarkMode ? 'grey.400' : 'grey.600',
                  opacity: 1
                }
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1,
                bgcolor: isDarkMode ? 'grey.800' : 'white',
                color: isDarkMode ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: isDarkMode ? 'grey.700' : 'grey.50'
                }
              }}
            >
              <Typography variant="body2">
                {option.label}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: isDarkMode ? 'grey.400' : 'grey.600',
                  ml: 1
                }}
              >
                صفحة {option.page}
              </Typography>
            </Box>
          )}
          ListboxProps={{
            sx: {
              bgcolor: isDarkMode ? 'grey.800' : 'white',
              maxHeight: '200px',
              '& .MuiAutocomplete-option': {
                bgcolor: isDarkMode ? 'grey.800' : 'white',
                color: isDarkMode ? 'white' : 'inherit'
              }
            }
          }}
          noOptionsText="لا توجد نتائج"
          clearOnEscape
          blurOnSelect
          size="small"
        />
      </Paper>
    </Box>
  );
};

export default MobileSurahSelector;