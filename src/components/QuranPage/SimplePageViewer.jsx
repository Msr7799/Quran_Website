// مكون بسيط لعرض صفحات القرآن - نفس طريقة مشروعك السابق
import React, { useState, useEffect } from 'react';

const SimplePageViewer = ({
  pageNumber,
  currentAyah,
  zoomLevel = 1,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // التأكد من أن المكون mounted
  useEffect(() => {
    setMounted(true);
    setLoading(true);
    setError(false);
  }, [pageNumber]);

  // معالجة تحميل الصفحة
  const handleLoad = () => {
    console.log('✅ تم تحميل صفحة القرآن:', pageNumber);
    setLoading(false);
    setError(false);
  };

  // معالجة خطأ التحميل
  const handleError = () => {
    console.warn('❌ خطأ في تحميل صفحة القرآن:', pageNumber);
    setLoading(false);
    setError(true);
  };

  // تكوين رابط SVG - نفس الطريقة من مشروعك السابق
  const svgUrl = `https://www.mp3quran.net/api/quran_pages_svg/${String(pageNumber).padStart(3, '0')}.svg`;

  // عدم عرض أي شيء حتى يكون المكون جاهز
  if (!mounted) {
    return (
      <div className={`simple-page-viewer ${className}`}>
        <div className="loading-message">جاري التحضير...</div>
      </div>
    );
  }

  return (
    <div className={`simple-page-viewer ${className}`}>
      {/* رسالة التحميل */}
      {loading && (
        <div className="loading-message">
          جارٍ تحميل الصفحة {pageNumber}...
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <p>خطأ في تحميل الصفحة. يرجى المحاولة مرة أخرى.</p>
          <button 
            onClick={() => {
              setError(false);
              setLoading(true);
              // إعادة تحميل الصفحة
              window.location.reload();
            }}
            className="retry-button"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* عرض صفحة القرآن - نفس طريقة مشروعك السابق */}
      <div
        className="mushaf-container"
        style={{ transform: `scale(${zoomLevel})` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <object
          id="svgPage"
          type="image/svg+xml"
          data={svgUrl}
          onLoad={handleLoad}
          onError={handleError}
          className="mushaf-page"
        >
          متصفحك لا يدعم عرض SVG
        </object>
      </div>

      {/* معلومات الآية الحالية */}
      {currentAyah && currentAyah.ayah > 0 && (
        <div className="current-ayah-info">
          <span className="ayah-number">آية {currentAyah.ayah}</span>
          <span className="format-indicator">SVG</span>
        </div>
      )}

      <style jsx>{`
        .simple-page-viewer {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 500px;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-message {
          text-align: center;
          color: #666;
          font-size: 18px;
          font-family: 'Arial', sans-serif;
          padding: 40px;
        }

        .error-message {
          text-align: center;
          color: #666;
          font-family: 'Arial', sans-serif;
          padding: 40px;
          max-width: 400px;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .retry-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Arial', sans-serif;
          font-size: 16px;
          margin-top: 16px;
          transition: background-color 0.3s ease;
        }

        .retry-button:hover {
          background: #5a67d8;
        }

        .mushaf-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
          cursor: grab;
        }

        .mushaf-container:active {
          cursor: grabbing;
        }

        .mushaf-page {
          width: 100%;
          max-width: 900px;
          height: auto;
          border: none;
          background: white;
        }

        .current-ayah-info {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'Arial', sans-serif;
          display: flex;
          gap: 10px;
          align-items: center;
          z-index: 20;
        }

        .ayah-number {
          font-weight: 600;
          color: #FFD700;
        }

        .format-indicator {
          font-size: 10px;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* تحسينات للشاشات الصغيرة */
        @media (max-width: 768px) {
          .current-ayah-info {
            top: 5px;
            right: 5px;
            padding: 6px 10px;
            font-size: 12px;
          }
          
          .mushaf-page {
            max-width: 100%;
          }
        }

        /* تحسينات للأداء */
        .mushaf-container {
          will-change: transform;
          contain: layout style paint;
        }
      `}</style>
    </div>
  );
};

export default SimplePageViewer;
