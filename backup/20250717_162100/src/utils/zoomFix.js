// ملف JavaScript لإصلاح مشكلة الزوم برمجياً

/**
 * إصلاح شامل لمشكلة الزوم في الموقع
 */
export const fixZoomIssues = () => {
  if (typeof window === 'undefined') return;

  // إزالة أي تحويلات غير مرغوب فيها
  const removeUnwantedTransforms = () => {
    const body = document.body;
    const html = document.documentElement;
    const nextRoot = document.getElementById('__next');
    const siteWrapper = document.querySelector('.siteWrapper');

    // إصلاح العناصر الأساسية
    [body, html, nextRoot, siteWrapper].forEach(element => {
      if (element) {
        element.style.zoom = '1';
        element.style.transform = 'scale(1)';
        element.style.transformOrigin = 'top left';
        element.style.webkitTransform = 'scale(1)';
        element.style.mozTransform = 'scale(1)';
        element.style.msTransform = 'scale(1)';
      }
    });

    // إصلاح فقط العناصر التي تحتوي على تحويلات غير مرغوب فيها
    const problematicElements = document.querySelectorAll('[style*="scale(0"], [style*="zoom:"]');
    problematicElements.forEach(element => {
      // تجنب العناصر التفاعلية
      const isInteractiveElement = element.matches('.instagramCard, .surahCard, .hadithContent, .navButton, .embla__button, .embla__dot, .sidebarIcon, [class*="Carousel"], [class*="embla"]');
      
      if (!isInteractiveElement) {
        const computedStyle = window.getComputedStyle(element);
        const transform = computedStyle.transform;
        
        // إصلاح فقط scale(0) أو zoom غير طبيعي
        if (transform && transform !== 'none') {
          const scaleMatch = transform.match(/scale\(([^)]+)\)/);
          if (scaleMatch) {
            const scaleValue = parseFloat(scaleMatch[1]);
            if (scaleValue === 0 || scaleValue < 0.7) {
              element.style.transform = transform.replace(/scale\([^)]+\)/, 'scale(1)');
            }
          }
        }
      }
    });
  };

  // تطبيق الإصلاحات
  removeUnwantedTransforms();

  // مراقب لإصلاح أي تغييرات جديدة
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && 
          (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
        removeUnwantedTransforms();
      }
    });
  });

  // بدء المراقبة
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ['style', 'class']
  });

  // إصلاح عند تغيير حجم النافذة
  window.addEventListener('resize', removeUnwantedTransforms);

  // إصلاح عند تحميل الصفحة بالكامل
  window.addEventListener('load', removeUnwantedTransforms);

  // إرجاع دالة للتنظيف
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', removeUnwantedTransforms);
    window.removeEventListener('load', removeUnwantedTransforms);
  };
};

/**
 * إصلاح مشاكل الزوم عند التحميل
 */
export const initializeZoomFix = () => {
  if (typeof window === 'undefined') return;

  // تطبيق الإصلاحات فوراً
  document.addEventListener('DOMContentLoaded', fixZoomIssues);
  
  // إذا كان DOM جاهز بالفعل
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixZoomIssues);
  } else {
    fixZoomIssues();
  }
};

/**
 * إصلاح خاص لعناصر Material-UI
 */
export const fixMUIZoomIssues = () => {
  if (typeof window === 'undefined') return;

  const fixMUIElements = () => {
    // إصلاح جميع عناصر MUI
    const muiElements = document.querySelectorAll('[class*="Mui"], [class*="MuiBox-root"]');
    muiElements.forEach(element => {
      if (element.style.transform && element.style.transform.includes('scale')) {
        const currentTransform = element.style.transform;
        // احتفظ بالتحويلات الأخرى ولكن أعد تعيين scale إلى 1
        element.style.transform = currentTransform.replace(/scale\([^)]+\)/g, 'scale(1)');
      }
    });
  };

  // تطبيق الإصلاح
  fixMUIElements();

  // مراقبة تغييرات MUI
  const muiObserver = new MutationObserver(() => {
    fixMUIElements();
  });

  muiObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });

  return () => muiObserver.disconnect();
};

// تصدير افتراضي
export default {
  fixZoomIssues,
  initializeZoomFix,
  fixMUIZoomIssues
};
