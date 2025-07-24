// src/components/ScrollToTop.tsx - مكون العودة لأعلى الصفحة الاحترافي
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  /** المسافة بالبكسل التي يجب التمرير إليها لإظهار الزر */
  showAfter?: number;
  /** سرعة التمرير (smooth, auto, instant) */
  behavior?: 'smooth' | 'auto' | 'instant';
  /** موضع الزر (bottom-right, bottom-left, bottom-center) */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /** حجم الزر */
  size?: 'small' | 'medium' | 'large';
  /** لون الزر */
  variant?: 'primary' | 'secondary' | 'dark' | 'light';
  /** إضافة كلاس CSS مخصص */
  className?: string;
  /** نص بديل للوصولية */
  ariaLabel?: string;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  showAfter = 300,
  behavior = 'smooth',
  position = 'bottom-right',
  size = 'medium',
  variant = 'primary',
  className = '',
  ariaLabel = 'العودة إلى أعلى الصفحة'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // مراقبة التمرير
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // إضافة مستمع التمرير مع throttling للأداء
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // فحص أولي
    toggleVisibility();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  // دالة العودة لأعلى
  const scrollToTop = () => {
    setIsScrolling(true);
    
    window.scrollTo({
      top: 0,
      behavior: behavior
    });

    // إعادة تعيين حالة التمرير بعد انتهاء الحركة
    setTimeout(() => {
      setIsScrolling(false);
    }, behavior === 'smooth' ? 800 : 100);
  };

  // معالجة الضغط على Enter أو Space
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToTop();
    }
  };

  // تحديد أحجام الزر
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-10 text-sm';
      case 'large':
        return 'w-16 h-16 text-xl';
      default:
        return 'w-12 h-12 text-base';
    }
  };

  // تحديد ألوان الزر
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'dark':
        return 'bg-gray-800 hover:bg-gray-900 text-white';
      case 'light':
        return 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  // تحديد موضع الزر
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'bottom-center':
        return 'bottom-6 left-1/2 transform -translate-x-1/2';
      default:
        return 'bottom-6 right-6';
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={scrollToTop}
        onKeyDown={handleKeyDown}
        className={`
          scroll-to-top-btn
          fixed z-50
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${getPositionClasses()}
          rounded-full
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out
          flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transform hover:scale-110 active:scale-95
          ${isScrolling ? 'animate-pulse' : ''}
          ${className}
        `}
        aria-label={ariaLabel}
        title={ariaLabel}
        type="button"
      >
        <ArrowUp 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          className={`transition-transform duration-200 ${isScrolling ? 'animate-bounce' : ''}`}
        />
      </button>

      {/* أنماط CSS إضافية */}
      <style jsx>{`
        .scroll-to-top-btn {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .scroll-to-top-btn:hover {
          transform: translateY(-2px) scale(1.05);
        }

        .scroll-to-top-btn:active {
          transform: translateY(0) scale(0.95);
        }

        /* تحسين للوضع المظلم */
        [data-theme="dark"] .scroll-to-top-btn {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        [data-theme="dark"] .scroll-to-top-btn:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        /* تحسين للحركة المنخفضة */
        @media (prefers-reduced-motion: reduce) {
          .scroll-to-top-btn {
            transition: none !important;
            animation: none !important;
          }
          
          .scroll-to-top-btn:hover {
            transform: none !important;
          }
        }

        /* تحسين للشاشات الصغيرة */
        @media (max-width: 768px) {
          .scroll-to-top-btn {
            bottom: 1rem !important;
            right: 1rem !important;
            left: auto !important;
            transform: none !important;
          }
        }

        /* تحسين للطباعة */
        @media print {
          .scroll-to-top-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default ScrollToTop;
