// src/components/Layout.jsx - النسخة المحدثة والمصلحة
import React, { useState, useEffect } from 'react';

/**
 * مكون Layout الرئيسي الذي يوفر التخطيط الأساسي للموقع
 * تم إصلاحه ليعمل مع الشريط الجانبي المتحرك دون فراغات جانبية
 */
const Layout = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // عدم عرض أي شيء حتى يتم تحميل المكون بالكامل
  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="layout-container">
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* الأنماط المصلحة للـ Layout */}
      <style jsx>{`
        .layout-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow-x: hidden;
          background-color: var(--background-color);
        }

        .main-content {
          flex: 1;
          width: 100%;
          position: relative;
          min-height: 100vh;
          
          /* إزالة المارجن الثابت لأن الشريط أصبح متحركاً */
          margin-right: 0;
          
          /* إضافة padding مناسب للمحتوى */
          padding: var(--spacing-lg);
          
          /* التأكد من استخدام العرض الكامل */
          max-width: 100%;
          box-sizing: border-box;
        }

        /* استجابة للشاشات الصغيرة */
        @media (max-width: 599px) {
          .main-content {
            padding: var(--spacing-md);
            padding-top: calc(var(--spacing-xl) + 60px); /* مساحة لزر الهمبرجر */
          }
        }

        /* استجابة للشاشات المتوسطة */
        @media (min-width: 600px) and (max-width: 959px) {
          .main-content {
            padding: var(--spacing-lg);
            padding-top: calc(var(--spacing-xl) + 60px);
          }
        }

        /* استجابة للشاشات الكبيرة */
        @media (min-width: 960px) {
          .main-content {
            padding: var(--spacing-xl);
            padding-top: calc(var(--spacing-xl) + 60px);
          }
        }

        /* تحسين الأداء */
        .layout-container {
          will-change: auto;
          contain: layout style paint;
        }

        .main-content {
          contain: layout style paint;
        }

        /* تحسين للطباعة */
        @media print {
          .main-content {
            margin-right: 0;
            padding: 0;
          }
        }
      `}</style>
    </>
  );
};

export default React.memo(Layout);
