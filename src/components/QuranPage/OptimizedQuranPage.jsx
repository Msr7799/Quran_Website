// مكون محسن لعرض صفحة القرآن
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { VolumeUp, VolumeOff } from '@mui/icons-material';
import styles from '../../styles/components/QuranPage.module.css';
import quranData from '../../utils/quranData';
import SVGPageViewer from './SVGPageViewer';
import SimpleAudioPlayer from '../AudioPlayer/SimpleAudioPlayer';
import SeoHead from '../SeoHead';
import { useAsyncLoading } from '../../hooks/useLoading';

// Lazy loading للمكونات الثقيلة
const TafseerPopup = lazy(() => import('../AudioPlayer/tafseer_popup'));

const OptimizedQuranPage = () => {
  const router = useRouter();
  const { page } = router.query;
  
  // حالات أساسية مبسطة
  const [state, setState] = useState({
    currentPage: 1,
    pageData: null,
    showAudioPlayer: true,
    selectedSurah: null,
    selectedReciter: null, // لا يوجد قارئ افتراضي
    isFullscreen: false,
    zoomLevel: 1
  });
  
  // حالة التحميل الموحدة
  const [loadingState, setLoadingState] = useState({
    page: true,
    audio: false,
    svg: false
  });
  
  const { loading: contentLoading, Loader: ContentLoader } = useAsyncLoading(
    loadingState.page,
    800
  );
  
  // تحديث رقم الصفحة
  useEffect(() => {
    if (page) {
      const pageNum = parseInt(page);
      if (pageNum >= 1 && pageNum <= quranData.totalPages) {
        setState(prev => ({ ...prev, currentPage: pageNum }));
      } else {
        router.replace('/quran-pages/1');
      }
    }
  }, [page, router]);
  
  // تحميل بيانات الصفحة
  useEffect(() => {
    const loadPageData = async () => {
      setLoadingState(prev => ({ ...prev, page: true }));
      
      try {
        const pageInfo = await quranData.getPageInfo(state.currentPage);
        setState(prev => ({
          ...prev,
          pageData: pageInfo,
          selectedSurah: pageInfo.surahs[0] || null
        }));
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      } finally {
        setLoadingState(prev => ({ ...prev, page: false }));
      }
    };
    
    if (state.currentPage) {
      loadPageData();
    }
  }, [state.currentPage]);
  
  // دوال التنقل
  const navigateToPage = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= quranData.totalPages) {
      router.push(`/quran-pages/${pageNumber}`);
    }
  }, [router]);
  
  // تبديل عرض مشغل الصوت
  const toggleAudioPlayer = useCallback(() => {
    setState(prev => ({ ...prev, showAudioPlayer: !prev.showAudioPlayer }));
  }, []);
  
  return (
    <>
      <ContentLoader text="جاري تحميل صفحة المصحف الشريف..." />
      
      <SeoHead
        title={`صفحة ${state.currentPage} - تصفح المصحف الشريف`}
        description={`تصفح صفحة ${state.currentPage} من المصحف الشريف`}
        keywords={`المصحف الشريف, صفحة ${state.currentPage}, القرآن الكريم`}
      />
      
      <Container 
        maxWidth="sm" 
        className={`${styles.quranPageContainer} ${state.isFullscreen ? styles.fullscreen : ''}`}
      >
        {/* شريط التحكم العلوي */}
        <Box className={styles.compactHeader}>
          <IconButton onClick={toggleAudioPlayer}>
            {state.showAudioPlayer ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          
          <Typography variant="body2">
            صفحة {state.currentPage}
          </Typography>
        </Box>
        
        {/* عارض الصفحة */}
        <Box className={styles.compactViewer}>
          <SVGPageViewer
            pageNumber={state.currentPage}
            zoomLevel={state.zoomLevel}
            className={styles.svgViewer}
          />
        </Box>
        
        {/* مشغل الصوت */}
        {state.showAudioPlayer && state.pageData && (
          <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
            <SimpleAudioPlayer
              surahNumber={state.selectedSurah?.number || 1}
              reciterId={state.selectedReciter}
              onReciterChange={(id) => setState(prev => ({ ...prev, selectedReciter: id }))}
              onSurahChange={(num) => {
                const targetPage = quranData.surahToPage[num];
                router.push(`/quran-pages/${targetPage}`);
              }}
            />
          </Box>
        )}
        
        {/* أزرار التنقل */}
        <IconButton
          onClick={() => navigateToPage(state.currentPage - 1)}
          disabled={state.currentPage <= 1}
          sx={{ position: 'fixed', bottom: 80, right: 20 }}
        >
          ▶
        </IconButton>
        
        <IconButton
          onClick={() => navigateToPage(state.currentPage + 1)}
          disabled={state.currentPage >= quranData.totalPages}
          sx={{ position: 'fixed', bottom: 80, left: 20 }}
        >
          ◀
        </IconButton>
        
        {/* نافذة التفسير - Lazy Loaded */}
        <Suspense fallback={null}>
          {/* سيتم إضافة TafseerPopup عند الحاجة */}
        </Suspense>
      </Container>
    </>
  );
};

export default OptimizedQuranPage;
