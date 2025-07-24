import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Link as MuiLink,
  Breadcrumbs,
  Button,
  styled,
} from '@mui/material';
import Link from 'next/link';
import Head from 'next/head';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import React from 'react';
import convertToArabicNumerals from '../../utils/convertToArabicNumerals';

// Custom styled components to ensure no underlines
const StyledMuiLink = styled('a')({
  textDecoration: 'none !important',
  color: 'inherit',
  display: 'block',
  width: '100%',
  '&:hover, &:focus, &:active': {
    textDecoration: 'none !important',
    backgroundColor: 'transparent !important',
  },
  '& .MuiTypography-root': {
    textDecoration: 'none !important',
  },
});

const StyledLink = styled('div')({
  textDecoration: 'none !important',
  '& a': {
    textDecoration: 'none !important',
  },
});

const RESULTS_PER_PAGE = 10; // Number of results per page

export default function SearchResults() {
  const router = useRouter();
  const { query } = router.query;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleResults, setVisibleResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    console.log('Router query:', query);
    const searchQuery = Array.isArray(query) ? query[0] : query;
    console.log('Extracted search query:', searchQuery);
    if (searchQuery) {
      const decodedQuery = decodeURIComponent(searchQuery);
      console.log('Decoded search query:', decodedQuery);
      fetchSearchResults(decodedQuery);
      setCurrentPage(1); // Reset to first page on new search
    }
  }, [query, router.isReady]);

  useEffect(() => {
    if (results.length > 0) {
      const total = Math.ceil(results.length / RESULTS_PER_PAGE);
      setTotalPages(total);
      updateVisibleResults();
    } else {
      setVisibleResults([]);
    }
  }, [results, currentPage]);

  const updateVisibleResults = () => {
    const endIndex = currentPage * RESULTS_PER_PAGE;
    setVisibleResults(results.slice(0, endIndex));
    setHasMore(endIndex < results.length);
  };

  const loadMoreResults = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const fetchSearchResults = async (searchTerm: string) => {
    if (!searchTerm?.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchTerm)}/all/ar`
      );
      
      if (!response.ok) {
        throw new Error('فشل في جلب نتائج البحث');
      }
      
      const data = await response.json();
      setResults(data.data?.matches || []);
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('حدث خطأ أثناء جلب نتائج البحث. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const searchQuery = Array.isArray(query) ? query[0] : query || '';
  const decodedQuery = searchQuery ? decodeURIComponent(searchQuery) : '';

  const renderResults = () => {
    if (loading && visibleResults.length === 0) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', my: 2 }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            إعادة المحاولة
          </Button>
        </Paper>
      );
    }

    if (visibleResults.length === 0) {
      if (!decodedQuery) {
        return (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography>أدخل كلمة أو عبارة للبحث في القرآن الكريم</Typography>
          </Paper>
        );
      }
      return (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography>لا توجد نتائج للبحث عن: {decodedQuery}</Typography>
        </Paper>
      );
    }

    return (
      <Paper elevation={2} sx={{ mt: 2 }}>
        <List>
          {visibleResults.map((result, index) => (
            <>
              <ListItem 
                alignItems="flex-start"
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                key={`${result.number}-${index}`}
              >
                <Link 
                  href={`/quran/${result.surah.number}#ayah-${result.numberInSurah}`} 
                  passHref
                  legacyBehavior
                >
                  <StyledMuiLink as="a">
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body1" 
                          component="div"
                          sx={{ 
                            fontSize: '1.2rem',
                            lineHeight: 1.8,
                            textAlign: 'right',
                            fontFamily: 'Hafs, Arial, sans-serif',
                          }}
                        >
                          {result.text}
                          <span 
                            style={{
                              fontSize: '0.9rem',
                              color: 'text.secondary',
                              marginRight: '8px',
                              fontFamily: 'Arial, sans-serif',
                            }}
                          >
                            {convertToArabicNumerals(result.numberInSurah)}
                          </span>
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          سورة {result.surah.englishName} - الآية {convertToArabicNumerals(result.numberInSurah)}
                        </Typography>
                      }
                    />
                  </StyledMuiLink>
                </Link>
              </ListItem>
              {index < visibleResults.length - 1 && <Divider component="li" />}
            </>
          ))}
        </List>
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Button 
              variant="outlined" 
              onClick={loadMoreResults}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'جاري التحميل...' : 'عرض المزيد من النتائج'}
            </Button>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: '70vh' }}>
      <Head>
        <title>{decodedQuery ? `نتائج البحث: ${decodedQuery} | القرآن الكريم` : 'البحث في القرآن الكريم'}</title>
        <meta name="description" content={decodedQuery ? `نتائج البحث عن: ${decodedQuery} في القرآن الكريم` : 'ابحث في آيات القرآن الكريم'} />
      </Head>
      
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs 
          aria-label="breadcrumb" 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link href="/" passHref legacyBehavior>
            <MuiLink 
              component="a"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                color: 'inherit',
                textDecoration: 'none !important',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'none !important',
                },
              }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              الرئيسية
            </MuiLink>
          </Link>
          <Typography color="text.primary">نتائج البحث</Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom>
          {decodedQuery ? `نتائج البحث عن: ${decodedQuery}` : 'البحث في القرآن الكريم'}
          {results.length > 0 && (
            <Typography variant="subtitle1" color="text.secondary">
              ({results.length} نتيجة)
            </Typography>
          )}
        </Typography>
        
        {renderResults()}
      </Box>
    </Container>
  );
}
