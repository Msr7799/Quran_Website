// مكون بسيط لعرض صفحات القرآن مثل المثال المرسل
import React, { useState, useEffect, useRef } from 'react';

const SimpleQuranViewer = ({ 
  initialPage = 1,
  currentAyah,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const objectRef = useRef(null);

  // تحديث الصفحة
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // معالجة تحميل الصفحة
  const handleLoad = () => {
    setLoading(false);
    setError(false);
    
    // محاولة إضافة التظليل إذا كان متاحاً
    if (currentAyah && objectRef.current) {
      addHighlightToSVG();
    }
  };

  // معالجة خطأ التحميل
  const handleError = () => {
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
          svgDoc.head.appendChild(style);

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
    if (!loading && !error && currentAyah) {
      addHighlightToSVG();
    }
  }, [currentAyah, loading, error]);

  // التنقل للصفحة التالية
  const nextPage = () => {
    if (currentPage < 604) {
      setCurrentPage(prev => prev + 1);
      setLoading(true);
      setError(false);
    }
  };

  // التنقل للصفحة السابقة
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setLoading(true);
      setError(false);
    }
  };

  // معالجة ضغط المفاتيح
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.key === 'ArrowRight') {
          prevPage(); // في العربية: اليمين = السابق
        } else {
          nextPage(); // في العربية: اليسار = التالي
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage]);

  // تكوين رابط الصفحة
  const pageUrl = `https://www.mp3quran.net/api/quran_pages_svg/${String(currentPage).padStart(3, '0')}.svg`;

  return (
    <div className={`simple-quran-viewer ${className}`}>
      {/* شريط التحكم العلوي */}
      <div className="controls-bar">
        <button 
          onClick={prevPage} 
          disabled={currentPage <= 1}
          className="nav-btn prev-btn"
          title="الصفحة السابقة (→)"
        >
          ←
        </button>
        
        <div className="page-info">
          <span className="page-number">صفحة {currentPage}</span>
          <span className="total-pages">من 604</span>
        </div>
        
        <button 
          onClick={nextPage} 
          disabled={currentPage >= 604}
          className="nav-btn next-btn"
          title="الصفحة التالية (←)"
        >
          →
        </button>
      </div>

      {/* منطقة عرض الصفحة */}
      <div className="page-container">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>جاري تحميل الصفحة {currentPage}...</p>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <div className="error-icon">⚠️</div>
            <h3>خطأ في تحميل الصفحة</h3>
            <p>لم يتم العثور على صفحة {currentPage}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              إعادة المحاولة
            </button>
          </div>
        )}

        <object
          ref={objectRef}
          data={pageUrl}
          type="image/svg+xml"
          width="100%"
          height="100%"
          className="quran-page-object"
          onLoad={handleLoad}
          onError={handleError}
        >
          <p>متصفحك لا يدعم عرض SVG</p>
        </object>
      </div>

      {/* معلومات الآية الحالية */}
      {currentAyah && currentAyah.ayah > 0 && (
        <div className="current-ayah-display">
          <span className="ayah-label">الآية الحالية:</span>
          <span className="ayah-number">{currentAyah.ayah}</span>
        </div>
      )}

      <style jsx>{`
        .simple-quran-viewer {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f8f9fa;
          font-family: var(--font-family-arabic);
        }

        .controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          background: white;
          border-bottom: 1px solid #dee2e6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .nav-btn {
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 50%;
          background: #007bff;
          color: white;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-btn:hover:not(:disabled) {
          background: #0056b3;
          transform: scale(1.1);
        }

        .nav-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
        }

        .page-info {
          text-align: center;
          font-size: 18px;
          font-weight: 600;
        }

        .page-number {
          color: #007bff;
          display: block;
        }

        .total-pages {
          color: #6c757d;
          font-size: 14px;
        }

        .page-container {
          flex: 1;
          position: relative;
          background: white;
          margin: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .quran-page-object {
          width: 100%;
          height: 100%;
          border: none;
        }

        .loading-overlay, .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          z-index: 10;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .retry-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--font-family-arabic);
          margin-top: 15px;
        }

        .retry-btn:hover {
          background: #0056b3;
        }

        .current-ayah-display {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 16px;
          z-index: 20;
        }

        .ayah-label {
          margin-left: 10px;
        }

        .ayah-number {
          font-weight: 600;
          color: #FFD700;
        }

        @media (max-width: 768px) {
          .controls-bar {
            padding: 10px 15px;
          }

          .nav-btn {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          .page-info {
            font-size: 16px;
          }

          .page-container {
            margin: 10px;
          }

          .current-ayah-display {
            top: 10px;
            right: 10px;
            padding: 8px 12px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleQuranViewer;
