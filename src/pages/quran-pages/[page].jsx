// src/pages/quran-pages/[page].jsx - صفحة تصفح المصحف الجديدة والمحسنة
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SeoHead from '../../components/SeoHead';
import CompactAudioPlayer from '../../components/AudioPlayer/CompactAudioPlayer';
import MobileTopBar from '../../components/MobileTopBar';
import TafseerPopup from '../../components/AudioPlayer/tafseer_popup';
import NewSVGPageViewer from '../../components/QuranPage/NewSVGPageViewer';
import PageNavigator from '../../components/Navigation/PageNavigator';
import MobileSurahSelector from '../../components/Navigation/MobileSurahSelector';
import { getPageInfo, getMainSurahForPage } from '../../utils/pageMapping';
import { Box, Typography, IconButton } from '@mui/material';
import { VolumeUp, VolumeOff } from '@mui/icons-material';

/**
 * صفحة تصفح المصحف الجديدة والمحسنة
 * تصميم نظيف ومتجاوب مع مكونات جديدة
 */
const QuranPageView = () => {
  const router = useRouter();
  const { page } = router.query;

  // الحالات الأساسية
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // حالات مشغل الصوت
  const [showAudioPlayer, setShowAudioPlayer] = useState(true);
  const [selectedReciter, setSelectedReciter] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);

  // حالات التفسير
  const [tafseerOpen, setTafseerOpen] = useState(false);
  const [selectedAyahForTafseer, setSelectedAyahForTafseer] = useState(null);

  // حالات إظهار/إخفاء أزرار التنقل
  const [showNavigationButtons, setShowNavigationButtons] = useState(true);
  const hideButtonsTimeoutRef = useRef(null);

  // بيانات الصفحة
  const [pageData, setPageData] = useState(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [surahsInPage, setSurahsInPage] = useState([]); // محجوز للاستخدام المستقبلي - عرض معلومات السور
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [metadata, setMetadata] = useState(null); // محجوز للاستخدام المستقبلي - بيانات إضافية
  const [isContentLoading, setIsContentLoading] = useState(true);

  // إعدادات المصحف
  const totalPages = 604;
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
  }, [page, router, totalPages]);

  // تتبع الوضع المظلم
  useEffect(() => {
    const checkDarkMode = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // تتبع وضع الشاشة الكاملة وإضافة CSS class للـ body
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      console.log('🔄 تغيير وضع الشاشة الكاملة:', isCurrentlyFullscreen ? 'مفعل' : 'معطل');
      
      // إضافة أو إزالة CSS class من الـ body
      if (isCurrentlyFullscreen) {
        document.body.classList.add('quran-fullscreen');
        console.log('✅ تم إضافة class quran-fullscreen');
      } else {
        document.body.classList.remove('quran-fullscreen');
        console.log('✅ تم إزالة class quran-fullscreen');
      }
    };

    // التحقق من الحالة الحالية عند تحميل المكون
    handleFullscreenChange();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // تنظيف عند انتهاء المكون
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.body.classList.remove('quran-fullscreen');
    };
  }, []);

  // تحميل البيانات الأساسية
  useEffect(() => {
    const loadData = async () => {
      setIsContentLoading(true);

      try {
        // تحميل metadata
        const metadataResponse = await fetch('/json/metadata.json');
        const metadataData = await metadataResponse.json();
        setMetadata(metadataData);

        // تحميل بيانات الصفحة
        const pageInfo = getPageInfo(currentPage);
        const mainSurah = getMainSurahForPage(currentPage);

        setPageData(pageInfo);
        setSurahsInPage(pageInfo.surahs || []);

        if (mainSurah && !selectedSurah) {
          setSelectedSurah(mainSurah.number);
        }

        console.log('✅ تم تحميل البيانات بنجاح');

      } catch (error) {
        console.error('❌ خطأ في تحميل البيانات:', error);
        setPageData({
          displayName: `صفحة ${currentPage}`,
          pageNumber: currentPage,
          surahs: []
        });
      } finally {
        setIsContentLoading(false);
      }
    };

    if (currentPage) {
      loadData();
    }
  }, [currentPage, selectedSurah]);

  // دوال التحكم الأساسية
  const navigateToPage = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      router.push(`/quran-pages/${pageNumber}`);
    }
  }, [router, totalPages]);

  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + zoomStep, maxZoom));
  }, [maxZoom, zoomStep]);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - zoomStep, minZoom));
  }, [minZoom, zoomStep]);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        // دخول وضع الشاشة الكاملة
        await document.documentElement.requestFullscreen();
      } else {
        // الخروج من وضع الشاشة الكاملة
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('خطأ في تبديل وضع الشاشة الكاملة:', error);
      // fallback: تحديث الـ state فقط إذا فشلت Fullscreen API
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  const toggleAudioPlayer = useCallback(() => {
    setShowAudioPlayer(prev => !prev);
  }, []);

  // معالجة النقر على الآية
  const handleAyahClick = useCallback((ayahData) => {
    setSelectedAyahForTafseer(ayahData);
    setTafseerOpen(true);
  }, []);

  // معالجة تغيير السورة من المشغل
  const handleSurahChange = useCallback((surahNumber) => {
    setSelectedSurah(surahNumber);
    // لا نقوم بالتوجيه التلقائي - المستخدم يختار السورة للاستماع فقط
    console.log('تم اختيار السورة:', surahNumber);
  }, []);

  // معالجة تغيير القارئ
  const handleReciterChange = useCallback((reciterId) => {
    setSelectedReciter(reciterId);
  }, []);

  // معالجة تغيير الصفحة من مكون التنقل
  const handlePageNavigatorChange = useCallback((pageNumber) => {
    navigateToPage(pageNumber);
  }, [navigateToPage]);

  // إدارة إظهار/إخفاء أزرار التنقل
  const showNavigationButtonsTemporarily = useCallback(() => {
    setShowNavigationButtons(true);

    // إلغاء المؤقت السابق إن وجد
    if (hideButtonsTimeoutRef.current) {
      clearTimeout(hideButtonsTimeoutRef.current);
    }

    // إخفاء الأزرار بعد 3 ثوانٍ من عدم النشاط
    hideButtonsTimeoutRef.current = setTimeout(() => {
      setShowNavigationButtons(false);
    }, 3000);
  }, []);

  // إظهار الأزرار عند اللمس أو الحركة
  const handleUserActivity = useCallback(() => {
    if (isFullscreen) {
      showNavigationButtonsTemporarily();
    }
  }, [isFullscreen, showNavigationButtonsTemporarily]);

  // التنقل بالكيبورد
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateToPage(currentPage - 1);
        handleUserActivity(); // إظهار الأزرار عند استخدام الكيبورد
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateToPage(currentPage + 1);
        handleUserActivity(); // إظهار الأزرار عند استخدام الكيبورد
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, isFullscreen, navigateToPage, handleUserActivity]);

  // تتبع نشاط المستخدم لإظهار/إخفاء أزرار التنقل
  useEffect(() => {
    if (!isFullscreen) return;

    const events = ['mousedown', 'mousemove', 'touchstart', 'touchmove', 'click'];

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // إظهار الأزرار في البداية
    showNavigationButtonsTemporarily();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      if (hideButtonsTimeoutRef.current) {
        clearTimeout(hideButtonsTimeoutRef.current);
      }
    };
  }, [isFullscreen, handleUserActivity, showNavigationButtonsTemporarily]);

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

    if (isLeftSwipe && currentPage < totalPages) {
      navigateToPage(currentPage + 1);
    }
    if (isRightSwipe && currentPage > 1) {
      navigateToPage(currentPage - 1);
    }
  };

  // معلومات الصفحة للعرض
  const pageInfo = pageData || {
    displayName: `صفحة ${currentPage}`,
    pageNumber: currentPage,
    surahs: []
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{pageInfo.displayName} - القرآن الكريم</title>
        <meta name="description" content={`تصفح ${pageInfo.displayName} من المصحف الشريف`} />
      </Head>

      <SeoHead
        title={pageInfo.displayName}
        description={`تصفح ${pageInfo.displayName} من المصحف الشريف`}
        url={`/quran-pages/${currentPage}`}
      />

      {/* شريط التحكم العلوي للموبايل - مخفي في وضع الشاشة الكاملة */}
      {!isFullscreen && (
        <MobileTopBar
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          currentPage={currentPage}
          totalPages={604}
          onPageChange={(newPage) => router.push(`/quran-pages/${newPage}`)}
        />
      )}

      {/* مكون اختيار السورة للموبايل - في الأعلى */}
      <MobileSurahSelector
        currentPage={currentPage}
        isDarkMode={isDarkMode}
        onPageChange={handlePageNavigatorChange}
        isFullscreen={isFullscreen}
      />

      <Box
        sx={{
          minHeight: '100vh',
          /* مساحة إضافية للشريط العلوي في الموبايل - فقط عندما لا يكون في وضع الشاشة الكاملة */
          paddingTop: isFullscreen ? '0' : { xs: '40px', md: '0' },
          background: isFullscreen
            ? (isDarkMode ? '#1a1a1a' : '#f8f9fa') /* خلفية مناسبة في وضع الشاشة الكاملة */
            : isDarkMode
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          position: 'relative',
          overflow: isFullscreen ? 'hidden' : 'auto'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* شريط التحكم العلوي المبسط - مخفي في وضع الشاشة الكاملة */}
        {!isFullscreen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '70px',
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(20, 20, 20, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
            boxShadow: isDarkMode
              ? '0 4px 20px rgba(0, 0, 0, 0.5)'
              : '0 4px 20px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(20px)',
            borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', /* توزيع المحتوى */
            padding: '0 20px',
            /* في الشاشات الصغيرة - نقل شريط التحكم للأسفل */
            '@media (max-width: 768px)': {
              position: 'fixed',
              top: 'auto',
              bottom: showAudioPlayer ? '70px' : '0px', /* فوق مشغل الصوت إذا كان مفعلاً */
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 2,
              height: '60px',
              padding: '10px 20px',
              borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              borderBottom: 'none',
              boxShadow: isDarkMode
                ? '0 -4px 20px rgba(0, 0, 0, 0.5)'
                : '0 -4px 20px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          {/* مساحة فارغة للتوازن */}
          <Box sx={{
            width: '200px',
            '@media (max-width: 768px)': {
              display: 'none' /* إخفاء في الشاشات الصغيرة */
            }
          }}></Box>

          {/* مكون التنقل المحسن في الوسط */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            '@media (max-width: 768px)': {
              order: 1, /* التنقل أولاً في الشاشات الصغيرة */
              marginBottom: '5px'
            }
          }}>
            <PageNavigator
              currentPage={currentPage}
              totalPages={totalPages}
              isDarkMode={isDarkMode}
              onPageChange={handlePageNavigatorChange}
            />
          </Box>

          {/* أدوات التحكم */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={toggleAudioPlayer}
              title={showAudioPlayer ? "إيقاف المشغل" : "تشغيل المشغل"}
              sx={(theme) => ({
                color: showAudioPlayer ? 'tomato' : (isDarkMode ? '#ffffff' : '#000000'),
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.5)',
                }
              })}
            >
              {showAudioPlayer ? <VolumeOff /> : <VolumeUp />}
            </IconButton>

            <IconButton
              onClick={zoomOut}
              disabled={zoomLevel <= minZoom}
              title="تصغير"
              sx={(theme) => ({
                color: isDarkMode ? '#ffffff' : '#000000',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.5)',
                },
                '&:disabled': {
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.2)',
                }
              })}
            >
              -
            </IconButton>

            <Typography
              variant="body2"
              onClick={resetZoom}
              title="إعادة تعيين التكبير"
              sx={(theme) => ({
                cursor: 'pointer',
                minWidth: '50px',
                textAlign: 'center',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: isDarkMode ? '#ffffff' : '#000000',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid rgba(0, 0, 0, 0.3)',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.5)',
                }
              })}
            >
              {Math.round(zoomLevel * 100)}%
            </Typography>

            <IconButton
              onClick={zoomIn}
              disabled={zoomLevel >= maxZoom}
              title="تكبير"
              sx={(theme) => ({
                color: isDarkMode ? '#ffffff' : '#000000',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.5)',
                },
                '&:disabled': {
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.2)',
                }
              })}
            >
              +
            </IconButton>

            <IconButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "الخروج من الشاشة الكاملة" : "تكبير الشاشة"}
              sx={(theme) => ({
                color: isDarkMode ? '#ffffff' : '#000000', /* ألوان متكيفة مع الوضع الليلي/النهاري */
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.3)'
                  : '1px solid rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0.5)',
                }
              })}
            >
              ⛶
            </IconButton>
          </Box>
        </Box>
        )}

        {/* منطقة عرض الصفحة الجديدة والنظيفة */}
        <Box
          sx={{
            marginTop: isFullscreen ? '0px' : '10px', /* إزالة المارجن في وضع الشاشة الكاملة */
            marginBottom: isFullscreen ? '0px' : (showAudioPlayer ? '80px' : '20px'), /* إزالة المارجن في وضع الشاشة الكاملة */
            padding: isFullscreen ? '0px' : '0px', /* إزالة البادينغ في وضع الشاشة الكاملة */
            display: 'flex',
            justifyContent: 'center',
            height: isFullscreen ? '100vh' : 'auto', /* ملء الشاشة في وضع الشاشة الكاملة */
            width: isFullscreen ? '100vw' : '100%', /* ملء عرض الشاشة في وضع الشاشة الكاملة، عرض كامل في الوضع العادي */
            /* في الشاشات الصغيرة - ترك مساحة لشريط التحكم السفلي */
            '@media (max-width: 758px)': {
              marginTop: '20px',
              marginRight: '-3px ',
              marginBottom: showAudioPlayer ? '80px' : '20px', /* مساحة للمشغل المضغوط */
              paddingBottom: '20px'
            }
          }}
        >
          {/* إطار الصفحة المحسن */}
          <Box
            sx={{
              width: isFullscreen ? '100vw' : '100%', /* ملء عرض الشاشة في وضع الشاشة الكاملة */
              maxWidth: isFullscreen ? 'none' : '900px', /* إزالة الحد الأقصى في وضع الشاشة الكاملة */
              height: isFullscreen ? '100vh' : 'auto', /* ملء ارتفاع الشاشة في وضع الشاشة الكاملة */
              background: isFullscreen
                ? 'transparent' /* خلفية شفافة في وضع الشاشة الكاملة لإظهار النص بوضوح */
                : isDarkMode
                  ? 'linear-gradient(145deg, #2a2a2a 0%, #1e1e1e 100%)'
                  : 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
              padding: isFullscreen ? '0px' : '0px', /* إزالة البادينغ في وضع الشاشة الكاملة */
              borderRadius: isFullscreen ? '0px' : '20px', /* إزالة الحواف المدورة في وضع الشاشة الكاملة */
              border: isFullscreen ? 'none' : (isDarkMode
                ? '3px solid rgba(255, 255, 255, 0.1)'
                : '3px solid rgba(0, 0, 0, 0.1)'), /* إزالة الحدود في وضع الشاشة الكاملة */
              boxShadow: isFullscreen ? 'none' : (isDarkMode
                ? '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'), /* إزالة الظلال في وضع الشاشة الكاملة */
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* تأثير الإضاءة المحسن */}
            {/* تأثير الإضاءة */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: isDarkMode
                  ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)'
                  : 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />

            {/* عارض صفحة القرآن الجديد */}
            <NewSVGPageViewer
              pageNumber={currentPage}
              onAyahClick={handleAyahClick}
              isLoading={isContentLoading}
              zoomLevel={zoomLevel}
              isFullscreen={isFullscreen}
            />
          </Box>
        </Box>

        {/* مشغل الصوت المحسن */}
        {showAudioPlayer && (
          <CompactAudioPlayer
            surahNumber={selectedSurah}
            reciterId={selectedReciter}
            onReciterChange={handleReciterChange}
            onSurahChange={handleSurahChange}
            isDarkMode={isDarkMode}
          />
        )}

        {/* نافذة التفسير */}
        <TafseerPopup
          open={tafseerOpen}
          onClose={() => setTafseerOpen(false)}
          ayahData={selectedAyahForTafseer}
        />

        {/* أزرار التنقل المخفية في وضع الشاشة الكاملة */}
        {isFullscreen && showNavigationButtons && (
          <>
            {/* زر التنقل للصفحة التالية - في اليسار للعربية (لأننا نقرأ من اليمين إلى اليسار) */}
            {currentPage < totalPages && (
              <IconButton
                onClick={() => {
                  navigateToPage(currentPage + 1);
                  handleUserActivity(); // إعادة تشغيل المؤقت
                }}
                title="الصفحة التالية"
                sx={(theme) => ({
                  position: 'fixed',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  fontSize: '24px',
                  border: theme.palette.mode === 'dark'
                    ? '2px solid rgba(255, 255, 255, 0.3)'
                    : '2px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(255, 255, 255, 0.7)',
                    transform: 'translateY(-50%) scale(1.1)'
                  },
                  zIndex: 1001
                })}
              >
                   ›

              </IconButton>
            )}

            {/* زر التنقل للصفحة السابقة - في اليمين للعربية */}
            {currentPage > 1 && (
              <IconButton
                onClick={() => {
                  navigateToPage(currentPage - 1);
                  handleUserActivity(); // إعادة تشغيل المؤقت
                }}
                title="الصفحة السابقة"
                sx={(theme) => ({
                  position: 'fixed',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  fontSize: '24px',
                  border: theme.palette.mode === 'dark'
                    ? '2px solid rgba(255, 255, 255, 0.3)'
                    : '2px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.5)'
                      : 'rgba(255, 255, 255, 0.7)',
                    transform: 'translateY(-50%) scale(1.1)'
                  },
                  zIndex: 1001
                })}
              >
         
                ‹                  </IconButton>
            )}

            {/* زر الخروج من وضع الشاشة الكاملة */}
            <IconButton
              onClick={() => setIsFullscreen(false)}
              title="الخروج من الشاشة الكاملة"
              sx={{
                position: 'fixed',
                top: '20px', /* نفس مستوى الشريط */
                left: '20px', /* في أقصى اليسار */
                width: '50px',
                height: '50px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                fontSize: '20px',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
                zIndex: 1002 /* أعلى من الشريط */
              }}
            >
              ✕
            </IconButton>

            {/* شريط التحكم العلوي في وضع الشاشة الكاملة */}
            <Box
              sx={{
                position: 'fixed',
                top: '15px',
                left: '80px', /* بعيداً عن اللوجو */
                right: '80px', /* بعيداً عن اللوجو */
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '25px',
                fontSize: '14px',
                zIndex: 1001,
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* نسبة التكبير - في اليسار */}
              <Typography variant="body2" sx={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                {Math.round(zoomLevel * 100)}%
              </Typography>

              {/* رقم الصفحة - في الوسط */}
              <Typography variant="body2" sx={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                صفحة {currentPage}
              </Typography>

              {/* أيقونة المشغل - في اليمين */}
              <IconButton
                onClick={toggleAudioPlayer}
                title={showAudioPlayer ? "إيقاف المشغل" : "تشغيل المشغل"}
                sx={{
                  color: showAudioPlayer ? '#4CAF50' : 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {showAudioPlayer ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
            </Box>
          </>
        )}


      </Box>
    </>
  );
};

export default QuranPageView;
