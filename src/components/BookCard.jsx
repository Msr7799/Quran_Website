// src/components/BookCard.jsx - مكون بطاقة الكتاب المحدث
import React, { useState } from 'react';
import Image from 'next/image';

/**
 * مكون بطاقة الكتاب المحدث
 * يعرض معلومات المصحف PDF مع تصميم responsive
 */
const BookCard = ({ 
  title, 
  format, 
  fileSize, 
  publicationYear, 
  pdfLink, 
  pdfImage, 
  bgColor = 'أزرق',
  description 
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);

  // تحديد لون الخلفية حسب النوع
  const getBackgroundColor = (color) => {
    switch (color) {
      case 'أزرق':
        return 'var(--primary-color)';
      case 'أخضر':
        return 'var(--success-color)';
      case 'أحمر':
        return 'var(--error-color)';
      case 'برتقالي':
        return 'var(--warning-color)';
      default:
        return 'var(--primary-color)';
    }
  };

  // تحديد أيقونة الملف
  const getFileIcon = (format) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'epub':
        return '📚';
      case 'mobi':
        return '📖';
      default:
        return '📄';
    }
  };

  // فتح الرابط في نافذة جديدة
  const handleDownload = () => {
    if (pdfLink) {
      window.open(pdfLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="book-card">
      {/* صورة الغلاف */}
      <div className="book-cover">
        {!isImageError ? (
          <Image
            src={pdfImage}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageError(true)}
            quality={85}
          />
        ) : (
          <div className="fallback-cover">
            <span className="fallback-icon">📖</span>
            <span className="fallback-text">مصحف شريف</span>
          </div>
        )}
        
        {/* تأثير التحميل */}
        {!isImageLoaded && !isImageError && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* شارة التنسيق */}
        <div className="format-badge">
          <span className="format-icon">{getFileIcon(format)}</span>
          <span className="format-text">{format}</span>
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="book-content">
        {/* العنوان */}
        <h3 className="book-title">{title}</h3>

        {/* الوصف (إذا كان متاحاً) */}
        {description && (
          <p className="book-description">{description}</p>
        )}

        {/* معلومات الكتاب */}
        <div className="book-info">
          <div className="info-item">
            <span className="info-icon">📏</span>
            <span className="info-label">الحجم:</span>
            <span className="info-value">{fileSize}</span>
          </div>
          
          <div className="info-item">
            <span className="info-icon">📅</span>
            <span className="info-label">النشر:</span>
            <span className="info-value">{publicationYear}</span>
          </div>
          
          <div className="info-item">
            <span className="info-icon">🎨</span>
            <span className="info-label">اللون:</span>
            <span className="info-value">{bgColor}</span>
          </div>
        </div>

        {/* أزرار العمل */}
        <div className="book-actions">
          <button className="action-btn primary" onClick={handleDownload}>
            <span className="btn-icon">📥</span>
            <span className="btn-text">تحميل</span>
          </button>
          
          <button className="action-btn secondary" onClick={handleDownload}>
            <span className="btn-icon">👁️</span>
            <span className="btn-text">معاينة</span>
          </button>
        </div>
      </div>

      {/* الأنماط */}
      <style jsx>{`
        .book-card {
          background: var(--background-paper);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          overflow: hidden;
          transition: all var(--transition-base);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .book-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-2xl);
        }

        .book-cover {
          position: relative;
          height: 280px;
          overflow: hidden;
          background: linear-gradient(135deg, ${getBackgroundColor(bgColor)}, ${getBackgroundColor(bgColor)}dd);
        }

        .fallback-cover {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, ${getBackgroundColor(bgColor)}, ${getBackgroundColor(bgColor)}dd);
          color: white;
        }

        .fallback-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-md);
        }

        .fallback-text {
          font-size: var(--font-size-lg);
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
          align-items: center;
          justify-content: center;
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

        .format-badge {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--font-size-sm);
          font-weight: 500;
          z-index: 3;
        }

        .format-icon {
          font-size: 1rem;
        }

        .book-content {
          padding: var(--spacing-xl);
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .book-title {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          font-family: var(--font-family-arabic);
          line-height: 1.4;
        }

        .book-description {
          font-size: var(--font-size-base);
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          font-family: var(--font-family-arabic);
        }

        .book-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-size-sm);
        }

        .info-icon {
          font-size: 1rem;
          width: 20px;
          text-align: center;
        }

        .info-label {
          color: var(--text-secondary);
          font-weight: 500;
          font-family: var(--font-family-arabic);
        }

        .info-value {
          color: var(--text-primary);
          font-weight: 600;
          font-family: var(--font-family-arabic);
        }

        .book-actions {
          display: flex;
          gap: var(--spacing-sm);
          margin-top: auto;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border: none;
          border-radius: var(--border-radius-lg);
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: 600;
          transition: all var(--transition-base);
          font-family: var(--font-family-arabic);
        }

        .action-btn.primary {
          background: var(--primary-color);
          color: white;
        }

        .action-btn.primary:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .action-btn.secondary {
          background: var(--background-color);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .action-btn.secondary:hover {
          background: var(--text-primary);
          color: var(--background-paper);
          transform: translateY(-2px);
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        .btn-text {
          font-size: var(--font-size-sm);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .book-cover {
            height: 220px;
          }

          .book-content {
            padding: var(--spacing-lg);
          }

          .book-title {
            font-size: var(--font-size-lg);
          }

          .book-actions {
            flex-direction: column;
          }

          .action-btn {
            padding: var(--spacing-md) var(--spacing-lg);
          }
        }

        @media (max-width: 480px) {
          .book-cover {
            height: 200px;
          }

          .book-content {
            padding: var(--spacing-md);
          }

          .fallback-icon {
            font-size: 3rem;
          }

          .format-badge {
            top: var(--spacing-sm);
            right: var(--spacing-sm);
            padding: var(--spacing-xs);
          }
        }

        /* تحسين الأداء */
        .book-card {
          will-change: transform;
          contain: layout style paint;
        }

        .book-cover {
          will-change: auto;
          contain: layout style paint;
        }

        /* تحسين للطباعة */
        @media print {
          .book-card {
            break-inside: avoid;
            box-shadow: none;
            border: 1px solid #ccc;
          }

          .book-actions {
            display: none;
          }

          .format-badge {
            background: #333;
            color: white;
          }
        }

        /* تحسين إمكانية الوصول */
        .action-btn:focus {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }

        .book-card:focus-within {
          ring: 2px solid var(--primary-color);
          ring-offset: 2px;
        }

        /* تحسين للحركة المنخفضة */
        @media (prefers-reduced-motion: reduce) {
          .book-card {
            transition: none;
          }
          
          .book-card:hover {
            transform: none;
          }
          
          .loading-spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(BookCard);