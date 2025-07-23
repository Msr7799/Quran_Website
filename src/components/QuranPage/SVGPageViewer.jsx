// مكون عرض صفحة القرآن SVG مع التظليل المحسن
import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';

const SVGPageViewer = forwardRef(({
  pageNumber,
  currentAyah = null,
  ayahTimings = [],
  zoomLevel = 1,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onAyahClick,
  className = ''
}, ref) => {
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const objectRef = useRef(null);
  const containerRef = useRef(null);

  // التأكد من أن المكون mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // إضافة التظليل للآية الحالية
  const addHighlight = useCallback(() => {
    if (!mounted || !objectRef.current || !currentAyah) return;

    try {
      const svgDoc = objectRef.current.contentDocument;
      if (!svgDoc) return;

      // إزالة التظليل السابق
      const existingHighlights = svgDoc.querySelectorAll('.ayah-highlight');
      existingHighlights.forEach(el => el.remove());

      // إضافة التظليل الجديد
      if (currentAyah.polygon && currentAyah.polygon !== 'null') {
        const svgElement = svgDoc.querySelector('svg');
        if (!svgElement) return;

        const highlightGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
        highlightGroup.classList.add('ayah-highlight');

        const polygon = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', currentAyah.polygon);
        polygon.setAttribute('fill', '#FFD700');
        polygon.setAttribute('opacity', '0.4');
        polygon.setAttribute('stroke', '#FFA500');
        polygon.setAttribute('stroke-width', '2');
        polygon.style.cursor = 'pointer';

        // إضافة حدث النقر
        polygon.addEventListener('click', () => {
          if (onAyahClick) {
            onAyahClick(currentAyah);
          }
        });

        highlightGroup.appendChild(polygon);

        // إضافة نقطة المركز
        if (currentAyah.x && currentAyah.y) {
          const circle = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', currentAyah.x);
          circle.setAttribute('cy', currentAyah.y);
          circle.setAttribute('r', '8');
          circle.setAttribute('fill', '#FF6B35');
          circle.setAttribute('opacity', '0.8');
          circle.classList.add('ayah-center-point');

          highlightGroup.appendChild(circle);
        }

        svgElement.appendChild(highlightGroup);
      }
    } catch (error) {
      console.warn('خطأ في إضافة التظليل:', error);
    }
  }, [mounted, currentAyah, onAyahClick]);

  // تطبيق التظليل عند تغيير الآية الحالية
  useEffect(() => {
    if (mounted && currentAyah) {
      // تأخير قصير للتأكد من تحميل SVG
      const timer = setTimeout(addHighlight, 100);
      return () => clearTimeout(timer);
    }
  }, [currentAyah, mounted, addHighlight]);

  // تكوين رابط SVG
  const svgUrl = `https://www.mp3quran.net/api/quran_pages_svg/${String(pageNumber).padStart(3, '0')}.svg`;

  // عدم عرض أي شيء حتى يكون المكون mounted (لتجنب مشاكل SSR)
  if (!mounted) {
    return (
      <div className={`svg-page-viewer loading ${className}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري التحضير...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`svg-page-viewer error ${className}`}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>خطأ في تحميل الصفحة</h3>
          <p>لم يتم العثور على صفحة {pageNumber}</p>
          <p className="error-details">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`svg-page-viewer ${className}`}
      style={{ transform: `scale(${zoomLevel})` }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* عرض صفحة SVG */}
      <div className="svg-object-container">
        <object
          ref={(el) => {
            objectRef.current = el;
            if (ref) {
              if (typeof ref === 'function') {
                ref(el);
              } else {
                ref.current = el;
              }
            }
          }}
          data={svgUrl}
          type="image/svg+xml"
          width="100%"
          height="100%"
          className="svg-object"
          onLoad={() => {
            setError(null);
            // إضافة التظليل بعد التحميل
            if (currentAyah && currentAyah.polygon) {
              setTimeout(addHighlight, 100);
            }
          }}
          onError={() => {
            setError('فشل في تحميل SVG');
          }}
        >
          <p>متصفحك لا يدعم عرض SVG</p>
        </object>
      </div>

      {/* معلومات الآية الحالية */}
      {currentAyah && currentAyah.ayah > 0 && (
        <div className="current-ayah-info">
          <span className="ayah-number">آية {currentAyah.ayah}</span>
          {currentAyah.start_time && currentAyah.end_time && (
            <span className="ayah-timing">
              {Math.floor(currentAyah.start_time / 1000)}s - {Math.floor(currentAyah.end_time / 1000)}s
            </span>
          )}
        </div>
      )}

      <style jsx>{`
        .svg-page-viewer {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-base);
          cursor: grab;
          background: white;
          border-radius: var(--border-radius-lg);
          overflow: hidden;
          will-change: transform;
          contain: layout style paint;
        }

        .svg-page-viewer:active {
          cursor: grabbing;
        }

        .svg-page-viewer.loading,
        .svg-page-viewer.error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          background: var(--background-paper);
          border-radius: var(--border-radius-lg);
        }

        .loading-container,
        .error-container {
          text-align: center;
          color: var(--text-secondary);
          max-width: 400px;
          padding: 2rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-details {
          font-size: 0.875rem;
          color: var(--error-color);
          margin: 1rem 0;
        }

        .retry-button {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          font-family: var(--font-family-arabic);
          transition: background-color 0.3s ease;
        }

        .retry-button:hover {
          background: var(--primary-dark);
        }

        .svg-object-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .svg-object {
          max-width: 100%;
          max-height: 100%;
          border: none;
          background: white;
        }

        .current-ayah-info {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-family: var(--font-family-arabic);
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 20;
          pointer-events: none;
        }

        .ayah-number {
          font-weight: 600;
          color: #FFD700;
        }

        .ayah-timing {
          font-size: 10px;
          opacity: 0.8;
        }

        /* تحسينات للشاشات الصغيرة */
        @media (max-width: 768px) {
          .current-ayah-info {
            top: 3px;
            right: 3px;
            padding: 3px 5px;
            font-size: 9px;
          }

          .ayah-timing {
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
});

SVGPageViewer.displayName = 'SVGPageViewer';

export default SVGPageViewer;
