import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Container,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
  Paper,
  Zoom,
  Fab,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  Search,
  Share,
  ZoomIn,
  ZoomOut,
  Home,
} from '@mui/icons-material';
import Link from 'next/link';

const QuranPageViewer = () => {
  const router = useRouter();
  const { page: pageParam } = router.query;
  const [page, setPage] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Total number of pages in the Quran
  const totalPages = 604;

  // Function to get surah number from page number (simplified mapping)
  const getSurahFromPage = (pageNum) => {
    // This is a simplified mapping. You'll need to create a complete mapping
    // from page numbers to surah numbers based on the standard Quran page layout
    if (pageNum <= 1) return 1; // Al-Fatiha
    if (pageNum <= 2) return 2; // Al-Baqarah starts
    if (pageNum <= 49) return 2; // Continue with Al-Baqarah
    if (pageNum <= 50) return 3; // Al-Imran
    // Add more mappings as needed...
    // For now, we'll use a simple fallback
    return Math.min(Math.ceil(pageNum / 20), 114); // Rough estimate
  };

  // Fetch page data when page changes
  useEffect(() => {
    if (!pageParam) return;
    
    const pageNum = parseInt(pageParam, 10) || 1;
    setPage(Math.min(Math.max(1, pageNum), totalPages));
    
    const fetchPage = async () => {
      try {
        setLoading(true);
        const surahNum = getSurahFromPage(pageNum);
        const response = await fetch(`https://quran-api-qklj.onrender.com/api/pages/${surahNum}`);
        if (!response.ok) throw new Error('Failed to fetch page');
        
        const data = await response.json();
        if (data.success && data.result && Array.isArray(data.result)) {
          // Find the page that matches our page number
          const pageData = data.result.find(p => p.page === pageNum);
          if (pageData && pageData.image) {
            const fullImageUrl = `https://quran-api-qklj.onrender.com${pageData.image.url}`;
            setImageUrl(fullImageUrl);
          } else {
            throw new Error('Page not found in surah data');
          }
        } else {
          throw new Error('Invalid API response format');
        }
        setError(null);
      } catch (err) {
        setError('حدث خطأ في تحميل الصفحة');
        console.error('Error fetching page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pageParam]);

  // Handle page navigation
  const goToPage = (newPage) => {
    const targetPage = Math.min(Math.max(1, newPage), totalPages);
    if (targetPage !== page) {
      router.push(`/quran-pages/${targetPage}`, undefined, { shallow: true });
    }
  };

  // Handle zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `صفحة ${page} من القرآن الكريم`,
          text: 'تصفح معي القرآن الكريم',
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ الرابط إلى الحافظة');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery && !isNaN(searchQuery)) {
      // If it's a number, treat as page number
      goToPage(parseInt(searchQuery, 10));
    } else if (searchQuery) {
      // TODO: Implement surah name search
      // For now, just show an alert
      alert('سيتم إضافة البحث باسم السورة قريباً');
    }
    setShowSearch(false);
  };

  return (
    <>
      <Head>
        <title>القرآن الكريم - الصفحة {page}</title>
        <meta name="description" content={`الصفحة ${page} من القرآن الكريم`} />
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          py: 2,
        }}
      >
        {/* Header */}
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Link href="/" passHref>
                <IconButton size="xlarge" sx={{ 
                  backgroundColor: '#1b1b1b',
                  marginTop: '50px',
                   color: '#fff',
                   '&:hover': {
                     backgroundColor: '#0d1b2a !important',
                     color: '#e0e1dd !important',
                   },
                  }} 
                   
                   aria-label="الرئيسية">
                  <Home />
                </IconButton>
              </Link>
            </Box>
            
            <Typography variant="h5" component="h1" sx={{ textAlign: 'center', flexGrow: 1 }}>
              القرآن الكريم - الصفحة {page}
            </Typography>
            
            <Box>
              <Tooltip title="بحث">
                <IconButton
                 onClick={() => setShowSearch(!showSearch)} 
                 size="xlarge" sx={{ 
                  backgroundColor: '#1b1b1b',
                  marginTop: '17px',
                  marginLeft: '10px',
                   color: '#fff',
                   '&:hover': {
                     backgroundColor: '#0d1b2a !important',
                     color: '#e0e1dd !important',
                   },
                  }} 
                  >
                  <Search />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="مشاركة">
                <IconButton 
                onClick={handleShare} 
                size="xlarge" sx={{ 
                  backgroundColor: '#1b1b1b',
                  marginTop: '17px',
                   color: '#fff',
                   '&:hover': {
                     backgroundColor: '#0d1b2a !important',
                     color: '#e0e1dd !important',
                   },
                  }} 
                >
                  <Share />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Search Bar */}
          {showSearch && (
            <Box sx={{ mb: 2 }}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="ابحث برقم الصفحة أو اسم السورة"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="submit">
                          <Search />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { bgcolor: 'background.paper' },
                  }}
                />
              </form>
            </Box>
          )}
        </Container>

        {/* Page Content */}
        <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 2, px: { xs: 1, sm: 2 } }}>
          {/* Page Title */}
          <Box sx={{ textAlign: 'center', mb: 2, mt: 1 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'var(--text-color)' }}>
              الصفحة {page} من القرآن الكريم
            </Typography>
          </Box>

          {error ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography color="error">{error}</Typography>
              <Typography>الرجاء المحاولة مرة أخرى</Typography>
            </Box>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper
              elevation={3}
              sx={{
                position: 'relative',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',

                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                p: 1,
                borderRadius: 2,
                minHeight: '100vh',
                maxHeight: '170vh',
                width: '110%',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#888',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555',
                },
              }}
            >
              <Box
                component="img"
                src={imageUrl}
                alt={`صفحة ${page} من القرآن الكريم`}
                sx={{
                  backgroundColor: '#f5f5f5 !important',
                  width: '70%',
                  maxWidth: '70%',
                  height: 'auto',
                  maxHeight: '120%',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  objectPosition: 'center',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.3s ease-in-out',
                }}
                loading="lazy"
              />
            </Paper>
          )}

          {/* Navigation Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 2,
              mb: 2,
              px: 1,
              gap: 2,
            }}
          >
            <Box>
              <Tooltip title="الصفحة التالية">
                <span>
                  <IconButton
                    onClick={() => goToPage(page - 1)}
                    disabled={page >= totalPages || loading}
                    size="large"
                    sx={{ 
                      backgroundColor: 'darkred',
                      marginLeft: 15,
                      color: 'white',
                      //hover
                      '&:hover': {
                        backgroundColor: 'lightgray !important',
                        color: 'black !important',
                      }
                     }}
                  >
                    <NavigateNext />
                  </IconButton>
                </span>
              </Tooltip>
              
              <Tooltip title="الصفحة السابقة">
                <span>
                  <IconButton
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages || loading}
                    size="large"
                    sx={{ 
                      backgroundColor: 'darkred',
                      marginLeft: 15,
                      color: 'white',
                      //hover
                      '&:hover': {
                        backgroundColor: 'lightgray !important',
                        color: 'black !important',
                      }
                    }}

                  >
                    <NavigateBefore />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Box>
              <Tooltip title="تكبير">
                <IconButton onClick={handleZoomIn} disabled={zoom >= 2} 
                  
                  sx={{
                    backgroundColor: '#1b1b1b',
                    marginLeft: 2,
                    color: 'white',
                    //hover
                    '&:hover': {
                      backgroundColor: 'lightgray !important',
                      color: 'black !important',
                    }
                  }}
                  >
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="تصغير">
                <IconButton onClick={handleZoomOut} disabled={zoom <= 0.5} 
                  
                  sx={{
                    backgroundColor: '#1b1b1b',
                    marginRight: 2,
                    color: 'white',
                    //hover
                    '&:hover': {
                      backgroundColor: 'lightgray !important',
                      color: 'black !important',
                    }
                  }}
                
                >
                  <ZoomOut />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Floating Action Buttons */}
      <Zoom in={!showSearch}>
        <Fab
          onClick={() => window.scrollTo( { top: 0, behavior: 'smooth' })}
          sx={{
            backgroundColor: '#778da9 !important',
            position: 'fixed',
            top: 500,
            left: 18,
            color: '#1b1b1b',
            '&:hover': {
              backgroundColor: '#0d1b2a !important',
              color: '#e0e1dd !important',
            },
          }}
        >
          <NavigateBefore />
        </Fab>
      </Zoom>
    </>
  );
};

export default QuranPageViewer;
