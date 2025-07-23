// src/pages/quran-pages/[page].jsx - صفحة تصفح المصحف المحسنة
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import SeoHead from '../../components/SeoHead';
import SVGPageViewer from '../../components/QuranPage/SVGPageViewer';
import SimpleAudioPlayer from '../../components/AudioPlayer/SimpleAudioPlayer';
import TafseerPopup from '../../components/AudioPlayer/tafseer_popup';
import { getPageInfo, getMainSurahForPage } from '../../utils/pageMapping';
import { getSurahPage } from '../../utils/surahPageMapping';
import PageLoader from '../../components/PageLoader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAsyncLoading } from '../../hooks/useLoading';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { VolumeUp, VolumeOff } from '@mui/icons-material';

/**
 * صفحة تصفح المصحف مع تصميم responsive
 * تدعم التنقل بين الصفحات والعرض المتجاوب
 */
const QuranPageView = () => {
  const router = useRouter();
  const { page } = router.query;

  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // حالات مشغل الصوت
  const [showAudioPlayer, setShowAudioPlayer] = useState(true); // إظهار المشغل افتراضياً
  const [currentAyah, setCurrentAyah] = useState(null);
  const [ayahTimings, setAyahTimings] = useState([]);
  const [selectedReciter, setSelectedReciter] = useState(1); // أول قارئ كافتراضي
  const [selectedSurah, setSelectedSurah] = useState(null); // السورة المختارة
  const svgRef = useRef(null); // مرجع لعنصر SVG للتظليل

  // حالات التفسير
  const [tafseerOpen, setTafseerOpen] = useState(false);
  const [selectedAyahForTafseer, setSelectedAyahForTafseer] = useState(null);

  // بيانات الصفحة
  const [pageData, setPageData] = useState(null);
  const [surahsInPage, setSurahsInPage] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [svgLoading, setSvgLoading] = useState(false);

  // إعدادات المصحف
  const totalPages = 604; // إجمالي صفحات المصحف
  const minZoom = 0.5;
  const maxZoom = 3;
  const zoomStep = 0.2;
  
  // تحديث رقم الصفحة عند تغيير الـ route
  useEffect(() => {
    setMounted(true);
    if (page) {
      const pageNum = parseInt(page);
      if (pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
      } else {
        router.replace('/quran-pages/1');
      }
    }
  }, [page, router]);

  // تتبع الوضع المظلم
  useEffect(() => {
    const checkDarkMode = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };

    checkDarkMode();

    // مراقبة تغييرات الثيم
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // التنقل بين الصفحات
  const navigateToPage = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      router.push(`/quran-pages/${pageNumber}`);
    }
  }, [router]);

  // التنقل بالكيبورد
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const nextPage = e.key === 'ArrowRight' ? currentPage - 1 : currentPage + 1;
        navigateToPage(nextPage);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, isFullscreen, navigateToPage]);

  // التنقل باللمس
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigateToPage(currentPage + 1);
    } else if (isRightSwipe) {
      navigateToPage(currentPage - 1);
    }
  };

  // وظائف التكبير
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + zoomStep, maxZoom));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - zoomStep, minZoom));
  };

  // دالة تحميل التوقيتات
  const loadAyahTimings = async (surahNumber) => {
    try {
      const response = await fetch(`https://mp3quran.net/api/v3/ayat_timing?surah=${surahNumber}&read=${selectedReciter}`);
      if (response.ok) {
        const timings = await response.json();
        setAyahTimings(timings);
        console.log(`تم تحميل ${timings.length} توقيت للسورة ${surahNumber}`);
      }
    } catch (error) {
      console.error('خطأ في تحميل التوقيتات:', error);
    }
  };

  // إعادة تحميل التوقيتات عند تغيير القارئ أو السورة
  useEffect(() => {
    const surahToLoad = selectedSurah || (surahsInPage.length > 0 ? surahsInPage[0] : null);
    if (surahToLoad) {
      loadAyahTimings(surahToLoad.number);
    }
  }, [selectedReciter, selectedSurah, surahsInPage]);



  // تحميل بيانات الصفحة من البيانات المحلية
  useEffect(() => {
    const loadPageData = async () => {
      try {
        setIsPageLoading(true);

        // استخدام pageMapping للحصول على معلومات الصفحة
        const pageInfo = await getPageInfo(currentPage);
        setPageData(pageInfo);
        setSurahsInPage(pageInfo.surahs || []);

        // إذا لم توجد سور محددة، نحاول الحصول على السورة الرئيسية
        if (pageInfo.surahs.length === 0) {
          const mainSurahNumber = getMainSurahForPage(currentPage);

          // تحميل بيانات السورة الرئيسية
          const metadataResponse = await fetch('/json/metadata.json');
          const metadata = await metadataResponse.json();
          const mainSurah = metadata.find(s => s.number === mainSurahNumber);

          if (mainSurah) {
            setSurahsInPage([mainSurah]);
            // تحميل التوقيتات للسورة الرئيسية
            loadAyahTimings(mainSurahNumber);
          }
        } else if (pageInfo.surahs.length > 0) {
          // تحميل التوقيتات للسورة الأولى في الصفحة
          setSelectedSurah(pageInfo.surahs[0]);
          loadAyahTimings(pageInfo.surahs[0].number);
        }

        // تأخير لإظهار التحميل الانسيابي
        setTimeout(() => {
          setIsPageLoading(false);
        }, 800);

      } catch (error) {
        console.error('خطأ في تحميل بيانات الصفحة:', error);
        // بيانات افتراضية في حالة الخطأ
        setPageData({
          displayName: `صفحة ${currentPage}`,
          pageNumber: currentPage,
          surahs: []
        });
        setSurahsInPage([]);
        setIsPageLoading(false);
      }
    };

    if (currentPage) {
      loadPageData();
    }
  }, [currentPage]);

  // معالجة النقر على الآية لعرض التفسير
  const handleAyahClick = useCallback((ayahData) => {
    setSelectedAyahForTafseer(ayahData);
    setTafseerOpen(true);
  }, []);

  // تبديل عرض مشغل الصوت
  const toggleAudioPlayer = useCallback(() => {
    setShowAudioPlayer(prev => !prev);
  }, []);

  const pageInfo = pageData || {
    displayName: `صفحة ${currentPage}`,
    pageNumber: currentPage,
    surahs: [],
    juz: 1,
    hizb: 1
  };

  if (!mounted) {
    return null;
  }

  return (
    <PageLoader
      isLoading={isPageLoading}
      loadingText="جاري تحميل صفحة المصحف الشريف..."
      animationType="fade"
      minLoadingTime={1200}
    >
      <SeoHead
        title={`صفحة ${currentPage} - تصفح المصحف الشريف`}
        description={`تصفح صفحة ${currentPage} من المصحف الشريف. ${pageInfo.displayName || `صفحة ${currentPage}`}`}
        keywords={`المصحف الشريف, صفحة ${currentPage}, ${pageInfo.displayName || ''}, القرآن الكريم, تصفح المصحف`}
        canonical={`${process.env.NEXT_PUBLIC_BASE_URL}/quran-pages/${currentPage}`}
        type="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": `صفحة ${currentPage} من المصحف الشريف`,
          "description": `تصفح صفحة ${currentPage} من المصحف الشريف - ${pageInfo.displayName || ''}`,
          "image": `https://www.mp3quran.net/api/quran_pages_svg/${String(currentPage).padStart(3, '0')}.svg`,
          "datePublished": "2024-01-01T00:00:00Z",
          "dateModified": new Date().toISOString(),
          "author": {
            "@type": "Organization",
            "name": "موقع القرآن الكريم"
          }
        }}
      />

      <Container maxWidth="sm" className={`quran-page-container ${isFullscreen ? 'fullscreen' : ''}`}>
        {/* شريط التحكم المدمج - مخفي مؤقتاً لتجنب التداخل */}
        <Box
          className="compact-header"
          sx={{
            position: 'fixed',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            width: 'auto',
            maxWidth: '90%',
            background: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '8px 16px',
            boxShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Box className="header-controls" sx={{ gap: '8px' }}>
            <IconButton size="small" onClick={toggleAudioPlayer} color={showAudioPlayer ? 'primary' : 'default'}>
              {showAudioPlayer ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
            </IconButton>

            <IconButton
              onClick={zoomOut}
              disabled={zoomLevel <= minZoom}
              sx={{ width: '36px', height: '36px', fontSize: '16px' }}
            >
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>-</Typography>
            </IconButton>

            <Typography variant="body2" sx={{
              fontSize: '12px',
              fontWeight: 'bold',
              minWidth: '50px',
              textAlign: 'center',
              background: isDarkMode ? 'rgba(50, 50, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              color: isDarkMode ? '#ffffff' : '#333333',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              {Math.round(zoomLevel * 100)}%
            </Typography>

            <IconButton
              onClick={zoomIn}
              disabled={zoomLevel >= maxZoom}
              sx={{ width: '36px', height: '36px', fontSize: '16px' }}
            >
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>+</Typography>
            </IconButton>

            <IconButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              sx={{ width: '36px', height: '36px', fontSize: '14px' }}
            >
              <Typography variant="h6" sx={{ fontSize: '14px' }}>
                {isFullscreen ? '⛶' : '⛶'}
              </Typography>
            </IconButton>
          </Box>
        </Box>

      {/* مشغل الصوت الثابت في الأسفل */}
      {showAudioPlayer && surahsInPage.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(20, 20, 20, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
            boxShadow: isDarkMode
              ? '0 -4px 20px rgba(0, 0, 0, 0.5), 0 -1px 4px rgba(0, 0, 0, 0.3)'
              : '0 -4px 20px rgba(0, 0, 0, 0.15), 0 -1px 4px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 8px'
          }}
        >
          <SimpleAudioPlayer
            surahNumber={selectedSurah?.number || surahsInPage[0]?.number || 1}
            reciterId={selectedReciter}
            onReciterChange={setSelectedReciter}
            onSurahChange={(surahNumber) => {
              // الانتقال إلى صفحة المصحف التي تحتوي على بداية السورة
              const targetPage = getSurahPage(surahNumber);
              router.push(`/quran-pages/${targetPage}`);
            }}
            onTimeUpdate={(currentTime) => {
              // يمكن إضافة منطق تتبع الآيات هنا لاحقاً
              console.log('Current time:', currentTime);
            }}
          />
        </Box>
        )}

        {/* منطقة عرض الصفحة المدمجة */}
        <Box
          className="compact-viewer"
          sx={{
            marginTop: '80px', // إضافة مساحة في الأعلى لتجنب التداخل مع شريط التحكم
            marginBottom: '20px'
          }}
        >

          {/* رقم الصفحة في الأعلى */}
          <Box
            sx={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              background: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              padding: '6px 16px',
              borderRadius: '20px',
              border: isDarkMode ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.1)',
              boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography variant="body2" sx={{
              fontWeight: 'bold',
              color: isDarkMode ? '#ffffff' : '#333',
              fontSize: '14px'
            }}>
              صفحة {currentPage}
            </Typography>
          </Box>

          {/* إطار الصفحة */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
              bottom: '20px',
              padding: '20px',
              border: '25px double #363636',
              borderRadius: '16px',
              paddingBottom: '20px',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.12),
                inset 0 1px 0 rgba(255, 255, 255, 0.8),
                inset 0 -1px 0 rgba(0, 0, 0, 0.05)
              `,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* تأثير الإضاءة */}
            <Box
              sx={{
                position: 'absolute',
                zIndex: 1,
                top: 0,
                left: 0,
                right: 0,
                height: '40px',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
                borderRadius: '16px 16px 0 0'
              }}
            />

            <SVGPageViewer
              pageNumber={currentPage}
              currentAyah={currentAyah}
              ayahTimings={ayahTimings}
              zoomLevel={zoomLevel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onAyahClick={handleAyahClick}
              className="svg-viewer"
              ref={svgRef}
            />
          </Box>
        </Box>

        {/* أزرار التنقل في الزوايا */}
        {/* زر الرجوع في الزاوية السفلى اليمنى */}
        <Box
          sx={{
            position: 'fixed',
            bottom: '70px', // فوق المشغل
            right: '20px',
            zIndex: 999
          }}
        >
          <IconButton
            onClick={() => navigateToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            sx={{
              width: '60px',
              height: '60px',
              background: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: isDarkMode ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.1)',
              fontSize: '24px',
              fontWeight: 'bold',
              color: isDarkMode ? '#ffffff' : '#333',
              boxShadow: isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.5)' : '0 4px 16px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                background: isDarkMode ? 'rgba(50, 50, 50, 1)' : 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-2px)',
                boxShadow: isDarkMode ? '0 6px 20px rgba(0, 0, 0, 0.7)' : '0 6px 20px rgba(0, 0, 0, 0.25)'
              },
              '&:disabled': {
                opacity: 0.5,
                background: isDarkMode ? 'rgba(50, 50, 50, 0.5)' : 'rgba(200, 200, 200, 0.5)'
              }
            }}
          >
            ▶
          </IconButton>
        </Box>

        {/* زر التالي في الزاوية السفلى اليسرى */}
        <Box
          sx={{
            position: 'fixed',
            bottom: '70px', // فوق المشغل
            left: '20px',
            zIndex: 999
          }}
        >
          <IconButton
            onClick={() => navigateToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            sx={{
              width: '60px',
              height: '60px',
              background: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: isDarkMode ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.1)',
              fontSize: '24px',
              fontWeight: 'bold',
              color: isDarkMode ? '#ffffff' : '#333',
              boxShadow: isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.5)' : '0 4px 16px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                background: isDarkMode ? 'rgba(50, 50, 50, 1)' : 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-2px)',
                boxShadow: isDarkMode ? '0 6px 20px rgba(0, 0, 0, 0.7)' : '0 6px 20px rgba(0, 0, 0, 0.25)'
              },
              '&:disabled': {
                opacity: 0.5,
                background: isDarkMode ? 'rgba(50, 50, 50, 0.5)' : 'rgba(200, 200, 200, 0.5)'
              }
            }}
          >
            ◀
          </IconButton>
        </Box>

        {/* اختيار الصفحة والسورة في الوسط السفلي */}
        <Box
          sx={{
            position: 'fixed',
            bottom: '70px', // فوق المشغل
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999,
            background: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: isDarkMode ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.1)',
            boxShadow: isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.5)' : '0 4px 16px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          {/* اختيار الصفحة */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Typography variant="body2" sx={{
              fontWeight: 'bold',
              color: isDarkMode ? '#ffffff' : '#333',
              fontSize: '12px'
            }}>
              صفحة
            </Typography>
            <select
              value={currentPage}
              onChange={(e) => navigateToPage(parseInt(e.target.value))}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                background: isDarkMode ? '#2d2d2d' : 'white',
                color: isDarkMode ? '#ffffff' : '#333',
                minWidth: '60px'
              }}
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </Box>

          {/* اختيار السورة */}
          {surahsInPage.length > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Typography variant="body2" sx={{
                fontWeight: 'bold',
                color: isDarkMode ? '#ffffff' : '#333',
                fontSize: '12px'
              }}>
                السورة
              </Typography>
              <select
                value={selectedSurah?.number || surahsInPage[0]?.number || 1}
                onChange={(e) => {
                  const surahNumber = parseInt(e.target.value);
                  const surah = surahsInPage.find(s => s.number === surahNumber);
                  setSelectedSurah(surah);
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  background: isDarkMode ? '#2d2d2d' : 'white',
                  color: isDarkMode ? '#ffffff' : '#333',
                  minWidth: '100px'
                }}
              >
                {surahsInPage.map((surah) => (
                  <option key={surah.number} value={surah.number}>
                    {surah.name?.ar || `سورة ${surah.number}`}
                  </option>
                ))}
              </select>
            </Box>
          )}
        </Box>

        {/* روابط سريعة مدمجة */}
        <Box className="quick-access">
          <Link href="/">🏠</Link>
          <Link href="/quran-pages/1">📖</Link>
          <Link href="/quran-pages/50">📝</Link>
          <Link href="/quran-pages/582">🌅</Link>
        </Box>

        {/* زر قائمة السور */}
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            zIndex: 1000
          }}
        >
          <Link href="/" passHref>
            <IconButton
              sx={{
                width: '50px',
                height: '50px',
                background: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: isDarkMode ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
                fontWeight: 'bold',
                color: isDarkMode ? '#ffffff' : '#333',
                boxShadow: isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.5)' : '0 4px 16px rgba(0, 0, 0, 0.2)',
                flexDirection: 'column',
                gap: '2px',
                '&:hover': {
                  background: isDarkMode ? 'rgba(50, 50, 50, 1)' : 'rgba(255, 255, 255, 1)',
                  transform: 'translateY(-2px)',
                  boxShadow: isDarkMode ? '0 6px 20px rgba(0, 0, 0, 0.7)' : '0 6px 20px rgba(0, 0, 0, 0.25)'
                }
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '16px' }}>📋</Typography>
              <Typography variant="caption" sx={{
                fontSize: '8px',
                lineHeight: 1,
                color: isDarkMode ? '#ffffff' : 'inherit'
              }}>قائمة السور</Typography>
            </IconButton>
          </Link>
        </Box>

        {/* نافذة التفسير */}
        <TafseerPopup
          open={tafseerOpen}
          onClose={() => setTafseerOpen(false)}
          surahNumber={selectedAyahForTafseer?.surah || 1}
          ayahNumber={selectedAyahForTafseer?.ayah || 1}
          ayahText={selectedAyahForTafseer?.text || ''}
          surahName={pageInfo.surahs?.[0]?.name?.ar || pageInfo.displayName || ''}
        />
      </Container>

      {/* الأنماط المدمجة */}
      <style jsx>{`
        .quran-page-container {
          width: 100%;
          min-height: 100vh;
          padding: 80px 4px 70px 4px; /* إضافة مساحة في الأعلى والأسفل */
          gap: 4px;
          display: flex;
          flex-direction: column;
          max-width: 500px;
          margin: 0 auto;
        }

        .quran-page-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1300;
          padding: 4px;
        }

        .compact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 6px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          font-size: 14px;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .page-title {
          font-family: var(--font-family-arabic);
          margin: 0;
        }

        .page-subtitle {
          font-family: var(--font-family-arabic);
          opacity: 0.7;
          margin: 0;
        }

        .header-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .header-controls .MuiIconButton-root {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(0, 0, 0, 0.1);
          width: 48px;
          height: 48px;
          font-size: 20px;
          font-weight: bold;
          color: #333;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
          margin: 0 4px;
        }

        .header-controls .MuiIconButton-root:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .zoom-display {
          min-width: 70px;
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          color: #333;
          background: rgba(255, 255, 255, 0.95);
          padding: 12px 16px;
          border-radius: 12px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .compact-viewer {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
          max-width: 450px;
          height: 550px;
          margin: 0 auto;
          background: transparent;
        }

        .svg-viewer {
          width: 100%;
          height: 100%;
        }



        .compact-navigation {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          padding: 16px;
          margin: 20px auto;
          max-width: 500px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          box-shadow:
            0 6px 24px rgba(0,0,0,0.12),
            0 2px 8px rgba(0,0,0,0.08);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .compact-navigation .MuiIconButton-root {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.1);
          width: 48px;
          height: 48px;
          font-size: 20px;
          font-weight: bold;
          color: #333;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .compact-navigation .MuiIconButton-root:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .page-info-compact {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .compact-select {
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: var(--font-family-arabic);
        }

        .quick-access {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 4px;
        }

        .quick-access a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          text-decoration: none;
          font-size: 14px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }

        .quick-access a:hover {
          transform: scale(1.05);
        }



        /* Responsive Design */
        @media (max-width: 768px) {
          .quran-page-container {
            padding: 2px;
            gap: 2px;
            max-width: 100%;
          }

          .compact-header {
            padding: 3px 6px;
            font-size: 12px;
          }

          .header-controls {
            gap: 1px;
          }

          .compact-viewer {
            height: 400px;
            max-width: 320px;
            margin: 10px auto;
          }

          .compact-navigation {
            gap: 4px;
            padding: 3px;
          }

          .quick-access {
            gap: 4px;
          }

          .quick-access a {
            width: 24px;
            height: 24px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .header-controls {
            flex-wrap: wrap;
          }

          .compact-viewer {
            height: 350px;
            max-width: 280px;
            margin: 8px auto;
          }

          .zoom-display {
            min-width: 25px;
            font-size: 9px;
          }

          .compact-select {
            padding: 2px 4px;
            font-size: 12px;
          }
        }

        /* الوضع المظلم */
        [data-theme="dark"] .header-controls .MuiIconButton-root {
          background: rgba(30, 30, 30, 0.95) !important;
          border: 2px solid rgba(255, 255, 255, 0.2) !important;
          color: #ffffff !important;
        }

        [data-theme="dark"] .header-controls .MuiIconButton-root:hover {
          background: rgba(50, 50, 50, 1) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        [data-theme="dark"] .zoom-display {
          background: rgba(30, 30, 30, 0.95) !important;
          border: 2px solid rgba(255, 255, 255, 0.2) !important;
          color: #ffffff !important;
        }

        [data-theme="dark"] .compact-navigation .MuiIconButton-root {
          background: rgba(30, 30, 30, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: #ffffff !important;
        }

        [data-theme="dark"] .compact-navigation .MuiIconButton-root:hover {
          background: rgba(50, 50, 50, 1) !important;
        }

        [data-theme="dark"] .compact-header {
          background: rgba(30, 30, 30, 0.9) !important;
          color: #ffffff !important;
        }

        [data-theme="dark"] .page-info-compact {
          background: rgba(30, 30, 30, 0.9) !important;
          color: #ffffff !important;
        }

        /* تحسين للطباعة */
        @media print {
          .page-header,
          .navigation-controls,
          .quick-links,
          .usage-instructions,
          .audio-player-container {
            display: none;
          }

          .page-viewer {
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </PageLoader>
  );
};

export default QuranPageView;