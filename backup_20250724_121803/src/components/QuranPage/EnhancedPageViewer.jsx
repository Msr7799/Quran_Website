// مكون محسن لعرض صفحات القرآن - طريقة بسيطة ومباشرة
import React, { useState, useEffect, useRef } from 'react';

const EnhancedPageViewer = ({
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
  const objectRef = useRef(null);

  // التأكد من أن المكون mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // معالجة تحميل الصفحة
  const handleLoad = () => {
    console.log('✅ تم تحميل صفحة القرآن:', pageNumber);
    setLoading(false);
    setError(false);

    // إضافة التظليل إذا كان متاحاً
    if (currentAyah && objectRef.current) {
      setTimeout(() => addHighlightToSVG(), 100);
    }
  };

  // معالجة خطأ التحميل
  const handleError = () => {
    console.warn('❌ خطأ في تحميل صفحة القرآن:', pageNumber);
    setLoading(false);
    setError(true);
  };

  // إضافة التظليل للـ SVG
  const addHighlightToSVG = () => {
    try {
      const objectElement = objectRef.current;
      const svgDoc = objectElement.contentDocument;

      if (svgDoc && currentAyah && currentAyah.polygon) {
        // إزالة التظليل السابق
        const existingHighlights = svgDoc.querySelectorAll('.ayah-highlight');
        existingHighlights.forEach(el => el.remove());

        // إضافة التظليل الجديد
        const svgElement = svgDoc.querySelector('svg');
        if (svgElement) {
          const highlightGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
          highlightGroup.classList.add('ayah-highlight');

          const polygon = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          polygon.setAttribute('points', currentAyah.polygon);
          polygon.setAttribute('fill', '#FFD700');
          polygon.setAttribute('opacity', '0.4');
          polygon.setAttribute('stroke', '#FFA500');
          polygon.setAttribute('stroke-width', '2');

          // إضافة animation
          const style = svgDoc.createElement('style');
          style.textContent = `
            .ayah-highlight polygon {
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0% { opacity: 0.4; }
              50% { opacity: 0.7; }
              100% { opacity: 0.4; }
            }
          `;
          if (svgDoc.head) {
            svgDoc.head.appendChild(style);
          }

          highlightGroup.appendChild(polygon);
          svgElement.appendChild(highlightGroup);
        }
      }
    } catch (error) {
      console.warn('لا يمكن إضافة التظليل:', error);
    }
  };

  // تحديث التظليل عند تغيير الآية
  useEffect(() => {
    if (!loading && !error && currentAyah && mounted) {
      setTimeout(() => addHighlightToSVG(), 100);
    }
  }, [currentAyah, loading, error, mounted]);

  // تكوين رابط SVG - نفس الطريقة من مشروعك السابق
  const svgUrl = `https://www.mp3quran.net/api/quran_pages_svg/${String(pageNumber).padStart(3, '0')}.svg`;

  // عدم عرض أي شيء حتى يكون المكون جاهز
  if (!mounted) {
    return (
      <div className={`enhanced-page-viewer ${className}`}>
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>جاري التحضير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`enhanced-page-viewer ${className}`}>
      {/* حالة التحميل */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>جاري تحميل صفحة {pageNumber}...</p>
        </div>
      )}

      {/* حالة الخطأ */}
      {error && (
        <div className="error-overlay">
          <div className="error-icon">⚠️</div>
          <h3>خطأ في تحميل الصفحة</h3>
          <p>لم يتم العثور على صفحة {pageNumber}</p>
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
              // إعادة تحميل الصفحة
              if (objectRef.current) {
                objectRef.current.data = svgUrl;
              }
            }}
            className="retry-btn"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* عرض SVG باستخدام object tag - نفس طريقة مشروعك السابق */}
      <div
        className="svg-container"
        style={{ transform: `scale(${zoomLevel})` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <object
          ref={objectRef}
          data={svgUrl}
          type="image/svg+xml"
          width="100%"
          height="100%"
          className="quran-page-object"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            maxWidth: '900px',
            height: 'auto'
          }}
        >
          <p>متصفحك لا يدعم عرض SVG</p>
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
        .enhanced-page-viewer {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 500px;
          background: white;
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .svg-container, .png-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-base);
          cursor: grab;
        }

        .svg-container:active, .png-container:active {
          cursor: grabbing;
        }

        .svg-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .png-highlight-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .fallback-content {
          text-align: center;
          color: var(--text-secondary);
          padding: 40px;
        }

        .fallback-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .try-svg-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          margin-top: 1rem;
          font-family: var(--font-family-arabic);
        }

        .try-svg-btn:hover {
          background: var(--primary-dark);
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
          font-family: var(--font-family-arabic);
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

        .format-controls {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          gap: 5px;
          z-index: 20;
        }

        .format-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .format-btn:hover {
          background: rgba(0, 0, 0, 0.9);
        }

        .format-btn.active {
          background: var(--primary-color);
        }

        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.7; }
          100% { opacity: 0.4; }
        }

        @media (max-width: 768px) {
          .current-ayah-info {
            top: 5px;
            right: 5px;
            padding: 6px 10px;
            font-size: 12px;
          }
          
          .format-controls {
            top: 5px;
            left: 5px;
          }
          
          .format-btn {
            width: 35px;
            height: 35px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedPageViewer;
