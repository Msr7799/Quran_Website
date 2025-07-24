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
import { Box, Container, Typography, IconButton } from '@mui/material';
import { VolumeUp, VolumeOff } from '@mui/icons-material';
import { useAsyncLoading } from '../../hooks/useLoading';

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
  const [metadata, setMetadata] = useState(null);

  const [svgLoading, setSvgLoading] = useState(false);
  const [audioPlayerReady, setAudioPlayerReady] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(true);

  // هوك اللودر للمحتوى الداخلي
  const { loading: contentLoading, Loader: ContentLoader } = useAsyncLoading(isContentLoading, 800);

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

        // مسح السورة المختارة من المشغل عند تغيير الصفحة يدوياً
        // (ليس عند الانتقال من المشغل)
        const isFromPlayer = sessionStorage.getItem('navigatingFromPlayer');
        if (!isFromPlayer) {
          sessionStorage.removeItem('selectedSurahFromPlayer');
        } else {
          // إزالة العلامة بعد الاستخدام
          sessionStorage.removeItem('navigatingFromPlayer');
        }
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

  // تحميل metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch('/json/metadata.json');
        const data = await response.json();
        setMetadata(data);
      } catch (error) {
        console.error('خطأ في تحميل metadata:', error);
      }
    };

    loadMetadata();
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
        // بدء التحميل
        setIsContentLoading(true);
        setAudioPlayerReady(false);
        setSvgLoading(true);

        // تأخير قصير لضمان ظهور اللودر
        await new Promise(resolve => setTimeout(resolve, 100));

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
            setSelectedSurah(mainSurah);
            console.log('🎯 تم تحديد السورة الرئيسية:', mainSurah.name.ar);
            // تحميل التوقيتات للسورة الرئيسية
            loadAyahTimings(mainSurahNumber);
          }
        } else if (pageInfo.surahs.length > 0) {
          // تحديد السورة الرئيسية للصفحة
          const mainSurah = getMainSurahForPage(currentPage);
          const selectedSurahForPage = mainSurah ?
            pageInfo.surahs.find(s => s.number === mainSurah) || pageInfo.surahs[0] :
            pageInfo.surahs[0];

          setSelectedSurah(selectedSurahForPage);
          console.log('🎯 تم تحديد السورة للصفحة:', selectedSurahForPage.name.ar);
          // تحميل التوقيتات للسورة المحددة
          loadAyahTimings(selectedSurahForPage.number);
        }

        // تم تحميل البيانات بنجاح - إنهاء اللودر وتفعيل المشغل
        setTimeout(() => {
          setIsContentLoading(false);
          setSvgLoading(false);
          // تأخير قصير لتفعيل المشغل بعد إخفاء اللودر
          setTimeout(() => {
            setAudioPlayerReady(true);
          }, 300);
        }, 500);

      } catch (error) {
        console.error('خطأ في تحميل بيانات الصفحة:', error);
        // بيانات افتراضية في حالة الخطأ
        setPageData({
          displayName: `صفحة ${currentPage}`,
          pageNumber: currentPage,
          surahs: []
        });
        setSurahsInPage([]);
        setAudioPlayerReady(false);
        setIsContentLoading(false);
        setSvgLoading(false);
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
    <>
      {/* لودر المحتوى الداخلي */}
      <ContentLoader text="جاري تحميل صفحة المصحف الشريف..." />
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
        {/* شريط التحكم العلوي المحسن */}
        <Box
          className="compact-header"
          sx={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1200,
            width: 'auto',
            maxWidth: '95%',
            background: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            padding: '12px 20px',
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              : '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box className="header-controls" sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'nowrap'
          }}>
            {/* زر تشغيل/إيقاف الصوت */}
            <IconButton
              onClick={toggleAudioPlayer}
              sx={{
                width: '44px',
                height: '44px',
                background: showAudioPlayer
                  ? (isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)')
                  : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
                border: showAudioPlayer
                  ? '2px solid rgba(76, 175, 80, 0.5)'
                  : `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                color: showAudioPlayer ? '#4CAF50' : (isDarkMode ? '#ffffff' : '#333333'),
                '&:hover': {
                  background: showAudioPlayer
                    ? (isDarkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)')
                    : (isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'),
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {showAudioPlayer ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
            </IconButton>

            {/* زر التصغير */}
            <IconButton
              onClick={zoomOut}
              disabled={zoomLevel <= minZoom}
              sx={{
                width: '44px',
                height: '44px',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                color: isDarkMode ? '#ffffff' : '#333333',
                '&:hover': {
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  opacity: 0.5,
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 'bold' }}>-</Typography>
            </IconButton>

            {/* عرض نسبة الزوم */}
            <Box sx={{
              minWidth: '70px',
              textAlign: 'center',
              background: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
              borderRadius: '12px',
              padding: '8px 12px',
              boxShadow: isDarkMode
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="body2" sx={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: isDarkMode ? '#ffffff' : '#333333',
                lineHeight: 1
              }}>
                {Math.round(zoomLevel * 100)}%
              </Typography>
            </Box>

            {/* زر التكبير */}
            <IconButton
              onClick={zoomIn}
              disabled={zoomLevel >= maxZoom}
              sx={{
                width: '44px',
                height: '44px',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                color: isDarkMode ? '#ffffff' : '#333333',
                '&:hover': {
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  opacity: 0.5,
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 'bold' }}>+</Typography>
            </IconButton>

            {/* زر الشاشة الكاملة */}
            <IconButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              sx={{
                width: '44px',
                height: '44px',
                background: isFullscreen
                  ? (isDarkMode ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)')
                  : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'),
                border: isFullscreen
                  ? '2px solid rgba(33, 150, 243, 0.5)'
                  : `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                color: isFullscreen ? '#2196F3' : (isDarkMode ? '#ffffff' : '#333333'),
                '&:hover': {
                  background: isFullscreen
                    ? (isDarkMode ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)')
                    : (isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'),
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                {isFullscreen ? '⛶' : '⛶'}
              </Typography>
            </IconButton>
          </Box>
        </Box>

      {/* مشغل الصوت الثابت في الأسفل */}
      {showAudioPlayer && surahsInPage.length > 0 && audioPlayerReady && pageData && !svgLoading && (
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
            surahNumber={(() => {
              // أولاً: التحقق من السورة المختارة من المشغل
              const selectedFromPlayer = sessionStorage.getItem('selectedSurahFromPlayer');
              if (selectedFromPlayer && metadata) {
                const surahNum = parseInt(selectedFromPlayer);
                const selectedSurahFromPlayer = metadata.find(s => s.number === surahNum);
                console.log('🎵 المشغل يستخدم السورة المختارة:', surahNum, 'اسم السورة:', selectedSurahFromPlayer?.name?.ar || 'غير محدد');
                return surahNum;
              }

              // ثانياً: استخدام السورة المحددة أو الأولى في الصفحة
              const surahNum = selectedSurah?.number || surahsInPage[0]?.number || 1;
              console.log('🎵 المشغل يستخدم السورة الافتراضية:', surahNum, 'اسم السورة:', selectedSurah?.name?.ar || 'غير محدد');
              return surahNum;
            })()}
            reciterId={selectedReciter}
            onReciterChange={setSelectedReciter}
            onSurahChange={(surahNumber) => {
              console.log('🎯 تم اختيار السورة رقم:', surahNumber, 'من المشغل');

              // حفظ السورة المختارة في sessionStorage
              sessionStorage.setItem('selectedSurahFromPlayer', surahNumber.toString());

              // إضافة علامة أن الانتقال من المشغل
              sessionStorage.setItem('navigatingFromPlayer', 'true');

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
            marginTop: '100px', // مساحة أكبر لتجنب التداخل مع شريط التحكم المحسن
            marginBottom: '20px',
            position: 'relative'
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

        {/* أزرار التنقل المحسنة في الزوايا */}
        {/* زر الصفحة السابقة في الزاوية السفلى اليمنى */}
        <Box
          className="navigation-buttons"
          sx={{
            position: 'fixed',
            bottom: '80px', // مساحة أكبر فوق المشغل
            right: '20px',
            zIndex: 1000
          }}
        >
          <IconButton
            onClick={() => navigateToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            sx={{
              width: '64px',
              height: '64px',
              background: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              border: isDarkMode ? '3px solid rgba(255, 255, 255, 0.3)' : '3px solid rgba(0, 0, 0, 0.15)',
              borderRadius: '50%',
              fontSize: '28px',
              fontWeight: 'bold',
              color: isDarkMode ? '#ffffff' : '#333',
              boxShadow: isDarkMode
                ? '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                : '0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: isDarkMode ? 'rgba(50, 50, 50, 1)' : 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-3px) scale(1.05)',
                boxShadow: isDarkMode
                  ? '0 12px 32px rgba(0, 0, 0, 0.8)'
                  : '0 12px 32px rgba(0, 0, 0, 0.3)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)'
              },
              '&:disabled': {
                opacity: 0.4,
                background: isDarkMode ? 'rgba(50, 50, 50, 0.3)' : 'rgba(200, 200, 200, 0.3)',
                transform: 'none'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            ▶
          </IconButton>
        </Box>

        {/* زر الصفحة التالية في الزاوية السفلى اليسرى */}
        <Box
          className="navigation-buttons"
          sx={{
            position: 'fixed',
            bottom: '80px', // مساحة أكبر فوق المشغل
            left: '20px',
            zIndex: 1000
          }}
        >
          <IconButton
            onClick={() => navigateToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            sx={{
              width: '64px',
              height: '64px',
              background: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              border: isDarkMode ? '3px solid rgba(255, 255, 255, 0.3)' : '3px solid rgba(0, 0, 0, 0.15)',
              borderRadius: '50%',
              fontSize: '28px',
              fontWeight: 'bold',
              color: isDarkMode ? '#ffffff' : '#333',
              boxShadow: isDarkMode
                ? '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                : '0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: isDarkMode ? 'rgba(50, 50, 50, 1)' : 'rgba(255, 255, 255, 1)',
                transform: 'translateY(-3px) scale(1.05)',
                boxShadow: isDarkMode
                  ? '0 12px 32px rgba(0, 0, 0, 0.8)'
                  : '0 12px 32px rgba(0, 0, 0, 0.3)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)'
              },
              '&:disabled': {
                opacity: 0.4,
                background: isDarkMode ? 'rgba(50, 50, 50, 0.3)' : 'rgba(200, 200, 200, 0.3)',
                transform: 'none'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

        {/* روابط سريعة محسنة */}
        <Box
          className="quick-access"
          sx={{
            position: 'fixed',
            top: '50%',
            left: '15px',
            transform: 'translateY(-50%)',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {[
            { href: '/', icon: '🏠', label: 'الرئيسية' },
            { href: '/quran-pages/1', icon: '📖', label: 'الفاتحة' },
            { href: '/quran-pages/50', icon: '📝', label: 'ق' },
            { href: '/quran-pages/582', icon: '🌅', label: 'الناس' }
          ].map((item, index) => (
            <Link key={index} href={item.href} passHref>
              <IconButton
                sx={{
                  width: '48px',
                  height: '48px',
                  background: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                  border: isDarkMode ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  fontSize: '20px',
                  boxShadow: isDarkMode
                    ? '0 4px 16px rgba(0, 0, 0, 0.5)'
                    : '0 4px 16px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: isDarkMode ? 'rgba(50, 50, 50, 1)' : 'rgba(255, 255, 255, 1)',
                    transform: 'translateX(-3px) scale(1.1)',
                    boxShadow: isDarkMode
                      ? '0 8px 24px rgba(0, 0, 0, 0.7)'
                      : '0 8px 24px rgba(0, 0, 0, 0.25)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.15)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                title={item.label}
              >
                {item.icon}
              </IconButton>
            </Link>
          ))}
        </Box>

        {/* زر قائمة السور المحسن */}
        <Box
          className="surah-list-button"
          sx={{
            position: 'fixed',
            top: '50%',
            right: '15px',
            transform: 'translateY(-50%)',
            zIndex: 1100
          }}
        >
          <Link href="/" passHref>
            <IconButton
              sx={{
                width: '60px',
                height: '80px',
                background: isDarkMode ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                border: isDarkMode ? '3px solid rgba(255, 255, 255, 0.3)' : '3px solid rgba(0, 0, 0, 0.15)',
                borderRadius: '16px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: isDarkMode ? '#ffffff' : '#333',
                boxShadow: isDarkMode
                  ? '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  : '0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(10px)',
                flexDirection: 'column',
                gap: '4px',
                '&:hover': {
                  background: isDarkMode ? 'rgba(50, 50, 50, 1)' : 'rgba(255, 255, 255, 1)',
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: isDarkMode
                    ? '0 12px 32px rgba(0, 0, 0, 0.8)'
                    : '0 12px 32px rgba(0, 0, 0, 0.3)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

          /* تحسين شريط التحكم العلوي للشاشات الصغيرة */
          .compact-header {
            top: 10px !important;
            padding: 8px 12px !important;
            max-width: 98% !important;
          }

          .header-controls {
            gap: 8px !important;
          }

          .header-controls .MuiIconButton-root {
            width: 36px !important;
            height: 36px !important;
            font-size: 14px !important;
          }

          /* تحسين أزرار التنقل للشاشات الصغيرة */
          .navigation-buttons .MuiIconButton-root {
            width: 52px !important;
            height: 52px !important;
            font-size: 24px !important;
            bottom: 60px !important;
          }

          /* تحسين الروابط السريعة للشاشات الصغيرة */
          .quick-access {
            left: 8px !important;
            gap: 8px !important;
          }

          .quick-access .MuiIconButton-root {
            width: 40px !important;
            height: 40px !important;
            font-size: 16px !important;
          }

          /* تحسين زر قائمة السور للشاشات الصغيرة */
          .surah-list-button {
            right: 8px !important;
            width: 48px !important;
            height: 64px !important;
          }

          /* تحسين المساحة العلوية للصفحة */
          .compact-viewer {
            margin-top: 80px !important;
          }
        }

        @media (max-width: 480px) {
          .compact-header {
            padding: 6px 10px !important;
            top: 5px !important;
            max-width: 99% !important;
          }

          .header-controls {
            flex-wrap: nowrap !important;
            gap: 4px !important;
          }

          .header-controls .MuiIconButton-root {
            width: 32px !important;
            height: 32px !important;
            font-size: 12px !important;
          }

          .navigation-buttons .MuiIconButton-root {
            width: 48px !important;
            height: 48px !important;
            font-size: 20px !important;
            bottom: 50px !important;
          }

          .quick-access {
            left: 5px !important;
            gap: 6px !important;
          }

          .quick-access .MuiIconButton-root {
            width: 36px !important;
            height: 36px !important;
            font-size: 14px !important;
          }

          .surah-list-button {
            right: 5px !important;
            width: 44px !important;
            height: 56px !important;
          }

          .compact-viewer {
            margin-top: 70px !important;
            height: 350px;
            max-width: 280px;
          }

          .zoom-display {
            min-width: 50px !important;
            font-size: 11px !important;
            padding: 4px 6px !important;
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
    </>
  );
};

export default QuranPageView;