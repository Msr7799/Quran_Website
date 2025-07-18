// src/pages/quran-pages/[page].jsx - صفحة تصفح المصحف
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import SeoHead from '../../components/SeoHead';

/**
 * صفحة تصفح المصحف مع تصميم responsive
 * تدعم التنقل بين الصفحات والعرض المتجاوب
 */
const QuranPageView = () => {
  const router = useRouter();
  const { page } = router.query;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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
        setImageLoaded(false);
        setImageError(false);
      } else {
        router.replace('/quran-pages/1');
      }
    }
  }, [page, router]);

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

  const resetZoom = () => {
    setZoomLevel(1);
  };

  // تحديد معلومات الصفحة الحالية
  const getPageInfo = (pageNum) => {
    // هذا مجرد مثال - يجب استبداله ببيانات حقيقية من API
    const surahs = {
      1: { name: 'الفاتحة', ayahStart: 1, ayahEnd: 7 },
      2: { name: 'البقرة', ayahStart: 1, ayahEnd: 286 },
      // ... باقي السور
    };
    
    // منطق تحديد السورة والآيات حسب رقم الصفحة
    // هذا يحتاج إلى بيانات دقيقة من مصدر موثوق
    
    return {
      surah: 'الفاتحة',
      ayahRange: '1-7',
      juz: 1,
      hizb: 1
    };
  };

  const pageInfo = getPageInfo(currentPage);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <SeoHead
        title={`صفحة ${currentPage} - تصفح المصحف الشريف`}
        description={`تصفح صفحة ${currentPage} من المصحف الشريف. سورة ${pageInfo.surah} - الآيات ${pageInfo.ayahRange}`}
        keywords={`المصحف الشريف, صفحة ${currentPage}, ${pageInfo.surah}, القرآن الكريم, تصفح المصحف`}
        canonical={`${process.env.NEXT_PUBLIC_BASE_URL}/quran-pages/${currentPage}`}
        type="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": `صفحة ${currentPage} من المصحف الشريف`,
          "description": `تصفح صفحة ${currentPage} من المصحف الشريف - ${pageInfo.surah}`,
          "image": `/images/pages/${String(currentPage).padStart(3, '0')}.png`,
          "datePublished": "2024-01-01T00:00:00Z",
          "dateModified": new Date().toISOString(),
          "author": {
            "@type": "Organization",
            "name": "موقع القرآن الكريم"
          }
        }}
      />

      <div className={`quran-page-container ${isFullscreen ? 'fullscreen' : ''}`}>
        {/* شريط التحكم العلوي */}
        <div className="page-header">
          <div className="page-info">
            <h1 className="page-title">صفحة {currentPage}</h1>
            <div className="page-details">
              <span className="detail-item">
                <span className="detail-icon">📖</span>
                سورة {pageInfo.surah}
              </span>
              <span className="detail-item">
                <span className="detail-icon">🔢</span>
                الآيات {pageInfo.ayahRange}
              </span>
              <span className="detail-item">
                <span className="detail-icon">📚</span>
                الجزء {pageInfo.juz}
              </span>
            </div>
          </div>
          
          <div className="page-controls">
            <button className="control-btn" onClick={zoomOut} disabled={zoomLevel <= minZoom} title="تصغير">
              <span className="control-icon">🔍-</span>
            </button>
            <button className="control-btn" onClick={resetZoom} title="إعادة تعيين التكبير">
              <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
            </button>
            <button className="control-btn" onClick={zoomIn} disabled={zoomLevel >= maxZoom} title="تكبير">
              <span className="control-icon">🔍+</span>
            </button>
            <button className="control-btn" onClick={() => setIsFullscreen(!isFullscreen)} title="ملء الشاشة">
              <span className="control-icon">{isFullscreen ? '🗗' : '🗖'}</span>
            </button>
          </div>
        </div>

        {/* منطقة عرض الصفحة */}
        <div className="page-viewer">
          <div 
            className="page-image-container"
            style={{ transform: `scale(${zoomLevel})` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {!imageError ? (
              <Image
                src={`/images/pages/${String(currentPage).padStart(3, '0')}.png`}
                alt={`صفحة ${currentPage} من المصحف الشريف`}
                fill
                style={{ objectFit: 'contain' }}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                priority={true}
                quality={95}
              />
            ) : (
              <div className="image-fallback">
                <div className="fallback-icon">📖</div>
                <h3>صفحة {currentPage}</h3>
                <p>لم يتم العثور على صورة هذه الصفحة</p>
                <p className="fallback-info">سورة {pageInfo.surah} - الآيات {pageInfo.ayahRange}</p>
              </div>
            )}
            
            {!imageLoaded && !imageError && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>جاري تحميل الصفحة...</p>
              </div>
            )}
          </div>
        </div>

        {/* أزرار التنقل */}
        <div className="navigation-controls">
          <button 
            className={`nav-btn prev ${currentPage <= 1 ? 'disabled' : ''}`}
            onClick={() => navigateToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <span className="nav-icon">◀</span>
            <span className="nav-text">الصفحة السابقة</span>
          </button>

          <div className="page-selector">
            <select 
              value={currentPage} 
              onChange={(e) => navigateToPage(parseInt(e.target.value))}
              className="page-select"
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  صفحة {i + 1}
                </option>
              ))}
            </select>
            <span className="total-pages">من {totalPages}</span>
          </div>

          <button 
            className={`nav-btn next ${currentPage >= totalPages ? 'disabled' : ''}`}
            onClick={() => navigateToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <span className="nav-text">الصفحة التالية</span>
            <span className="nav-icon">▶</span>
          </button>
        </div>

        {/* روابط سريعة */}
        <div className="quick-links">
          <h3 className="quick-links-title">انتقال سريع</h3>
          <div className="quick-links-grid">
            <Link href="/quran-pages/1" className="quick-link">
              <span className="quick-link-icon">🏠</span>
              <span className="quick-link-text">الفاتحة</span>
            </Link>
            <Link href="/quran-pages/2" className="quick-link">
              <span className="quick-link-icon">📝</span>
              <span className="quick-link-text">البقرة</span>
            </Link>
            <Link href="/quran-pages/50" className="quick-link">
              <span className="quick-link-icon">👤</span>
              <span className="quick-link-text">ق</span>
            </Link>
            <Link href="/quran-pages/582" className="quick-link">
              <span className="quick-link-icon">🌅</span>
              <span className="quick-link-text">الملك</span>
            </Link>
          </div>
        </div>

        {/* تعليمات الاستخدام */}
        <div className="usage-instructions">
          <h4 className="instructions-title">تعليمات الاستخدام</h4>
          <div className="instructions-grid">
            <div className="instruction-item">
              <span className="instruction-icon">⌨️</span>
              <span className="instruction-text">استخدم الأسهم للتنقل</span>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">👆</span>
              <span className="instruction-text">اسحب لليمين أو اليسار</span>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">🔍</span>
              <span className="instruction-text">اضغط + أو - للتكبير</span>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">🖥️</span>
              <span className="instruction-text">اضغط F لملء الشاشة</span>
            </div>
          </div>
        </div>
      </div>

      {/* الأنماط */}
      <style jsx>{`
        .quran-page-container {
          width: 100%;
          min-height: 100vh;
          background: var(--background-color);
          display: flex;
          flex-direction: column;
          padding: var(--spacing-lg);
          gap: var(--spacing-lg);
        }

        .quran-page-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: var(--z-modal);
          background: var(--background-paper);
          padding: var(--spacing-md);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--background-paper);
          padding: var(--spacing-lg);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }

        .page-info {
          flex: 1;
        }

        .page-title {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--primary-color);
          margin: 0 0 var(--spacing-sm) 0;
          font-family: var(--font-family-arabic);
        }

        .page-details {
          display: flex;
          gap: var(--spacing-lg);
          flex-wrap: wrap;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          font-family: var(--font-family-arabic);
        }

        .detail-icon {
          font-size: 1rem;
        }

        .page-controls {
          display: flex;
          gap: var(--spacing-sm);
          align-items: center;
        }

        .control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: 1px solid var(--border-color);
          background: var(--background-color);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          color: var(--text-primary);
        }

        .control-btn:hover:not(:disabled) {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .control-icon {
          font-size: 1.1rem;
        }

        .zoom-level {
          font-size: var(--font-size-xs);
          font-weight: 600;
        }

        .page-viewer {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background-paper);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          position: relative;
          overflow: auto;
          min-height: 500px;
        }

        .page-image-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          aspect-ratio: 3/4;
          transition: transform var(--transition-base);
          cursor: grab;
        }

        .page-image-container:active {
          cursor: grabbing;
        }

        .image-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--text-secondary);
          padding: var(--spacing-2xl);
        }

        .fallback-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
        }

        .fallback-info {
          color: var(--primary-color);
          font-weight: 600;
          font-family: var(--font-family-arabic);
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          z-index: 2;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .navigation-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--background-paper);
          padding: var(--spacing-lg);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: var(--border-radius-lg);
          cursor: pointer;
          font-size: var(--font-size-base);
          font-weight: 600;
          transition: all var(--transition-base);
          font-family: var(--font-family-arabic);
        }

        .nav-btn:hover:not(.disabled) {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .nav-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .page-selector {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-family: var(--font-family-arabic);
        }

        .page-select {
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          font-size: var(--font-size-base);
          font-family: var(--font-family-arabic);
          background: var(--background-color);
          color: var(--text-primary);
        }

        .total-pages {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .quick-links {
          background: var(--background-paper);
          padding: var(--spacing-lg);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }

        .quick-links-title {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-md) 0;
          font-family: var(--font-family-arabic);
        }

        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-md);
        }

        .quick-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          text-decoration: none;
          color: var(--text-primary);
          transition: all var(--transition-base);
          font-family: var(--font-family-arabic);
        }

        .quick-link:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
          transform: translateY(-2px);
        }

        .quick-link-icon {
          font-size: 1.2rem;
        }

        .usage-instructions {
          background: var(--background-paper);
          padding: var(--spacing-lg);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }

        .instructions-title {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-md) 0;
          font-family: var(--font-family-arabic);
        }

        .instructions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
        }

        .instruction-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          font-family: var(--font-family-arabic);
        }

        .instruction-icon {
          font-size: 1.1rem;
          width: 24px;
          text-align: center;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .quran-page-container {
            padding: var(--spacing-md);
            gap: var(--spacing-md);
          }

          .page-header {
            flex-direction: column;
            gap: var(--spacing-md);
            align-items: stretch;
          }

          .page-controls {
            justify-content: center;
          }

          .page-details {
            justify-content: center;
            text-align: center;
          }

          .navigation-controls {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .nav-btn {
            width: 100%;
            justify-content: center;
          }

          .quick-links-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .instructions-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .page-controls {
            flex-wrap: wrap;
          }

          .control-btn {
            width: 40px;
            height: 40px;
          }

          .quick-links-grid {
            grid-template-columns: 1fr;
          }

          .page-viewer {
            min-height: 400px;
          }
        }

        /* تحسين الأداء */
        .page-image-container {
          will-change: transform;
          contain: layout style paint;
        }

        .loading-overlay {
          will-change: opacity;
        }

        /* تحسين إمكانية الوصول */
        .nav-btn:focus,
        .control-btn:focus,
        .page-select:focus {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }

        /* تحسين للطباعة */
        @media print {
          .page-header,
          .navigation-controls,
          .quick-links,
          .usage-instructions {
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