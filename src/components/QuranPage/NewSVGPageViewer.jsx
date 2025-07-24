// مكون عارض صفحات القرآن الجديد والنظيف
import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const NewSVGPageViewer = ({
  pageNumber,
  onAyahClick,
  isLoading = false,
  zoomLevel = 1,
  isFullscreen = false
}) => {
  const [svgContent, setSvgContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgRef = useRef(null);

  // تحميل محتوى SVG للصفحة
  useEffect(() => {
    const loadSVGPage = async () => {
      if (!pageNumber || pageNumber < 1 || pageNumber > 604) {
        setError('رقم صفحة غير صحيح');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔄 تحميل صفحة SVG رقم:', pageNumber);
        
        // تنسيق رقم الصفحة بثلاثة أرقام
        const paddedPageNumber = pageNumber.toString().padStart(3, '0');
        const svgUrl = `https://www.mp3quran.net/api/quran_pages_svg/${paddedPageNumber}.svg`;
        
        const response = await fetch(svgUrl);
        
        if (!response.ok) {
          throw new Error(`فشل في تحميل الصفحة: ${response.status}`);
        }
        
        const svgText = await response.text();
        
        // تنظيف محتوى SVG
        const cleanedSvg = svgText
          .replace(/<\?xml[^>]*\?>/i, '')
          .trim();

        setSvgContent(cleanedSvg);
        console.log('✅ تم تحميل صفحة SVG بنجاح');
        
      } catch (error) {
        console.error('❌ خطأ في تحميل صفحة SVG:', error);
        setError('فشل في تحميل الصفحة');
      } finally {
        setLoading(false);
      }
    };

    loadSVGPage();
  }, [pageNumber]);

  // معالجة النقر على الآيات
  useEffect(() => {
    if (!svgContent || !svgRef.current) return;

    const svgElement = svgRef.current;
    
    const handleClick = (event) => {
      // البحث عن عنصر الآية المنقور عليه
      let target = event.target;
      
      // البحث في العناصر الأب للعثور على بيانات الآية
      while (target && target !== svgElement) {
        if (target.getAttribute && target.getAttribute('data-ayah')) {
          const ayahNumber = target.getAttribute('data-ayah');
          const surahNumber = target.getAttribute('data-surah');
          
          if (ayahNumber && surahNumber && onAyahClick) {
            onAyahClick({
              ayahNumber: parseInt(ayahNumber),
              surahNumber: parseInt(surahNumber),
              ayahText: target.textContent || '',
              surahName: `سورة رقم ${surahNumber}`
            });
          }
          break;
        }
        target = target.parentElement;
      }
    };

    svgElement.addEventListener('click', handleClick);
    
    return () => {
      svgElement.removeEventListener('click', handleClick);
    };
  }, [svgContent, onAyahClick]);

  // عرض حالة التحميل
  if (loading || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          جاري تحميل الصفحة {pageNumber}...
        </Typography>
      </Box>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="error">
          خطأ في تحميل الصفحة
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  // عرض محتوى SVG
  return (
    <Box
      sx={{
        width: '100%',
        height: isFullscreen ? '100vh' : 'auto', /* ملء الشاشة في وضع الشاشة الكاملة */
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: isFullscreen ? '100vh' : '400px', /* ملء الشاشة في وضع الشاشة الكاملة */
        maxHeight: isFullscreen ? 'none' : '155vh', /* إزالة الحد الأقصى في وضع الشاشة الكاملة */
        position: 'relative'
      }}
    >
      <Box
        ref={svgRef}
        sx={{
          width: isFullscreen ? '100vw' : '100%', /* ملء عرض الشاشة في وضع الشاشة الكاملة */
          height: isFullscreen ? '100vh' : 'auto', /* ملء ارتفاع الشاشة في وضع الشاشة الكاملة */
          maxWidth: isFullscreen ? 'none' : '1000px', /* إزالة الحد الأقصى في وضع الشاشة الكاملة */
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center', /* توسيط التكبير في وضع الشاشة الكاملة */
          transition: 'transform 0.3s ease',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& svg': {
            width: isFullscreen ? 'auto' : '100%', /* تكيف تلقائي في وضع الشاشة الكاملة */
            height: isFullscreen ? '95vh' : 'auto', /* تقليل الارتفاع قليلاً لإظهار النص الكامل */
            maxWidth: isFullscreen ? '95vw' : '110%', /* تقليل العرض الأقصى لإظهار النص على الحواف */
            maxHeight: isFullscreen ? '95vh' : 'none', /* تقليل الارتفاع الأقصى */
            objectFit: isFullscreen ? 'contain' : 'none', /* احتواء الصورة في وضع الشاشة الكاملة */
            filter: 'brightness(1.1) contrast(1.2)', // تحسين الوضوح
            background: isFullscreen ? '#ffffff' : '#ffffff', // خلفية بيضاء دائماً لوضوح النص
            borderRadius: isFullscreen ? '0px' : '8px', /* إزالة الحواف المدورة في وضع الشاشة الكاملة */
            padding: isFullscreen ? '20px' : '10px' /* إضافة بادينغ خفيف في وضع الشاشة الكاملة لحماية النص من القطع */
          },
          '& text': {
            cursor: 'pointer',
            '&:hover': {
              fill: '#2196F3',
              opacity: 0.8
            }
          }
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </Box>
  );
};

export default NewSVGPageViewer;
