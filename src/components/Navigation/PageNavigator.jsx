// src/components/Navigation/PageNavigator.jsx - مكون التنقل بين الصفحات
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  Search,
  MenuBook
} from '@mui/icons-material';

// استيراد البيانات
import surahsData from '../../../public/json/metadata.json';
import { getSurahPage } from '../../utils/surahPageMapping';

const PageNavigator = ({ 
  currentPage = 1, 
  totalPages = 604, 
  isDarkMode = false,
  onPageChange 
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [pageInput, setPageInput] = useState('');
  const [surahInput, setSurahInput] = useState('');
  const [showSurahSearch, setShowSurahSearch] = useState(false);
  const pageInputRef = useRef(null);
  const surahInputRef = useRef(null);

  // إعداد قائمة السور للبحث
  const surahOptions = surahsData.map(surah => ({
    id: surah.number,
    label: surah.name.ar,
    transliteration: surah.name.transliteration,
    page: getSurahPage(surah.number)
  }));

  // تحديث قيمة الصفحة عند تغيير الصفحة الحالية
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // إخفاء البحث عن السورة في الشاشات الصغيرة عند التحميل
  useEffect(() => {
    if (isMobile) {
      setShowSurahSearch(false);
    }
  }, [isMobile]);

  // دالة التنقل إلى صفحة معينة
  const navigateToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      if (onPageChange) {
        onPageChange(pageNumber);
      } else {
        router.push(`/quran-pages/${pageNumber}`);
      }
    }
  };

  // معالجة إدخال رقم الصفحة
  const handlePageInputChange = (event) => {
    const value = event.target.value;
    // السماح فقط بالأرقام
    if (/^\d*$/.test(value)) {
      setPageInput(value);
    }
  };

  // معالجة الضغط على Enter في حقل الصفحة
  const handlePageInputKeyPress = (event) => {
    if (event.key === 'Enter') {
      const pageNumber = parseInt(pageInput);
      if (pageNumber && pageNumber >= 1 && pageNumber <= totalPages) {
        navigateToPage(pageNumber);
        pageInputRef.current?.blur();
      }
    }
  };

  // معالجة اختيار السورة
  const handleSurahSelect = (event, selectedSurah) => {
    if (selectedSurah) {
      const pageNumber = selectedSurah.page;
      navigateToPage(pageNumber);
      setSurahInput('');
      setShowSurahSearch(false);
    }
  };

  // معالجة تغيير نص البحث للسورة
  const handleSurahInputChange = (event, newValue) => {
    setSurahInput(newValue);
  };

  // التنقل للصفحة السابقة
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      navigateToPage(currentPage - 1);
    }
  };

  // التنقل للصفحة التالية
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      navigateToPage(currentPage + 1);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 0.5, md: 1 },
        p: { xs: 0.5, md: 1 },
        bgcolor: isDarkMode ? 'grey.800' : 'white',
        borderRadius: 2,
        minWidth: 'fit-content',
        maxWidth: { xs: '280px', md: 'none' }
      }}
    >
      {/* زر الصفحة السابقة */}
      <Tooltip title="الصفحة السابقة">
        <IconButton
          onClick={goToPreviousPage}
          disabled={currentPage <= 1}
          size="small"
          sx={{ 
            color: isDarkMode ? 'white' : 'inherit',
            '&:disabled': {
              color: isDarkMode ? 'grey.600' : 'grey.400'
            }
          }}
        >
          <NavigateBefore />
        </IconButton>
      </Tooltip>

      {/* حقل إدخال رقم الصفحة */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.3, md: 0.5 } }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: isDarkMode ? 'grey.300' : 'grey.600',
            fontSize: { xs: '0.7rem', md: '0.8rem' }
          }}
        >
          صفحة
        </Typography>
        <TextField
          ref={pageInputRef}
          value={pageInput}
          onChange={handlePageInputChange}
          onKeyPress={handlePageInputKeyPress}
          variant="outlined"
          size="small"
          inputProps={{
            style: {
              textAlign: 'center',
              width: isMobile ? '40px' : '50px',
              padding: isMobile ? '2px 4px' : '4px 8px',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              color: isDarkMode ? 'white' : 'inherit'
            },
            maxLength: 3
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: isDarkMode ? 'grey.700' : 'grey.50',
              '& fieldset': {
                borderColor: isDarkMode ? 'grey.600' : 'grey.300'
              },
              '&:hover fieldset': {
                borderColor: isDarkMode ? 'grey.500' : 'grey.400'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main'
              }
            }
          }}
        />
        <Typography 
          variant="body2" 
          sx={{ 
            color: isDarkMode ? 'grey.300' : 'grey.600',
            fontSize: { xs: '0.7rem', md: '0.8rem' },
            display: { xs: 'none', sm: 'block' }
          }}
        >
          من {totalPages}
        </Typography>
      </Box>

      {/* فاصل - مخفي في الشاشات الصغيرة */}
      <Box 
        sx={{ 
          width: '1px', 
          height: '20px', 
          bgcolor: isDarkMode ? 'grey.600' : 'grey.300',
          display: { xs: 'none', md: 'block' }
        }} 
      />

      {/* زر البحث بالسورة - مخفي في الشاشات الصغيرة */}
      <Tooltip title="البحث بالسورة">
        <IconButton
          onClick={() => setShowSurahSearch(!showSurahSearch)}
          size="small"
          sx={{ 
            color: isDarkMode ? 'white' : 'inherit',
            bgcolor: showSurahSearch ? (isDarkMode ? 'grey.700' : 'grey.100') : 'transparent',
            display: { xs: 'none', md: 'flex' }
          }}
        >
          <MenuBook fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* حقل البحث بالسورة - مخفي في الشاشات الصغيرة */}
      {showSurahSearch && !isMobile && (
        <Autocomplete
          ref={surahInputRef}
          options={surahOptions}
          getOptionLabel={(option) => option.label}
          onChange={handleSurahSelect}
          onInputChange={handleSurahInputChange}
          value={null}
          inputValue={surahInput}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="اكتب اسم السورة"
              variant="outlined"
              size="small"
              sx={{
                width: '200px',
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDarkMode ? 'grey.700' : 'grey.50',
                  '& fieldset': {
                    borderColor: isDarkMode ? 'grey.600' : 'grey.300'
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
                  fontSize: '0.9rem'
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
              '& .MuiAutocomplete-option': {
                bgcolor: isDarkMode ? 'grey.800' : 'white',
                color: isDarkMode ? 'white' : 'inherit'
              }
            }
          }}
          noOptionsText="لا توجد نتائج"
          clearOnEscape
          blurOnSelect
        />
      )}

      {/* زر الصفحة التالية */}
      <Tooltip title="الصفحة التالية">
        <IconButton
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          size="small"
          sx={{ 
            color: isDarkMode ? 'white' : 'inherit',
            '&:disabled': {
              color: isDarkMode ? 'grey.600' : 'grey.400'
            }
          }}
        >
          <NavigateNext />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default PageNavigator;