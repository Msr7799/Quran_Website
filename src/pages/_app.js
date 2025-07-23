// src/pages/_app.js - النسخة الجديدة بدون theme folder
import Head from 'next/head';
import React, { useEffect } from 'react';

// استيراد ملفات CSS الموحدة
import '../styles/variables.css';
import '../styles/globals.css';

// استيراد المكونات
import AppAppBar from '../components/AppAppBar';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

/**
 * المكون الأساسي للتطبيق
 * يستخدم النظام الجديد المعتمد على CSS المتغيرات
 * بدلاً من Material-UI theme
 */
export default function MyApp({ Component, pageProps }) {
  // إعداد الوضع المظلم عند تحميل التطبيق ومنع الوميض
  useEffect(() => {
    // إظهار المحتوى فوراً عند تحميل React
    const nextDiv = document.getElementById('__next');
    if (nextDiv) {
      nextDiv.classList.add('loaded');
    }

    // التحقق من الإعدادات المحفوظة أو تفضيلات النظام
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    // حفظ الإعداد إذا لم يكن محفوظاً
    if (!savedTheme) {
      localStorage.setItem('theme', theme);
    }
  }, []);

  return (
    <>
      <Head>
        {/* Meta tags أساسية */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="color-scheme" content="light dark" />
        
        {/* تحسين الأداء */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        
        {/* الخطوط العربية */}
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
        {/* أيقونات Material */}
        <link 
          href="https://fonts.googleapis.com/icon?family=Material+Icons" 
          rel="stylesheet" 
        />
        
        {/* معلومات أساسية */}
        <meta name="description" content="موقع القرآن الكريم - تلاوة وتصفح واستماع القرآن الكريم" />
        <meta name="author" content="موقع القرآن الكريم" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph للشبكات الاجتماعية */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="القرآن الكريم" />
        <meta property="og:locale" content="ar_AR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* رابط canonical */}
        <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL} />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Head>

      {/* ضع الـ AppAppBar هنا ليكون دائماً فوق كل شيء */}
      <AppAppBar />

      <div className="app-container">
        {/* المحتوى الرئيسي للتطبيق */}
        <Layout>
          <Component {...pageProps} />
        </Layout>
        
        {/* التذييل */}
        <Footer />
      </div>

      {/* الأنماط العامة للتطبيق */}
      <style jsx>{`


        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--background-color);
          color: var(--text-primary);
          font-family: var(--font-family-primary);
          line-height: 1.6;
        }

        /* تحسين الأداء */
        .app-container {
          will-change: auto;
          contain: layout style paint;
        }

        /* تحسين للحركة المنخفضة */
        @media (prefers-reduced-motion: reduce) {
          .top-logo {
            transition: none !important;
          }

          .top-logo:hover {
            transform: none !important;
          }

          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }



        /* تحسين للطباعة */
        @media print {
          .app-container {
            background: white;
            color: black;
          }
        }

        /* تحسين للشاشات عالية الكثافة */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .app-container {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
      `}</style>
    </>
  );
}

// إعدادات Next.js للتطبيق
MyApp.getInitialProps = async ({ ctx }) => {
  return {};
};