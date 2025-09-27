// src/pages/_app.js - النسخة الجديدة بدون theme folder
import Head from 'next/head';
import React, { useEffect } from 'react';

// استيراد ملفات CSS الموحدة
import '../styles/variables.css';
import '../styles/globals.css';
import '../styles/loaders.css';

// استيراد المكونات
import AppAppBar from '../components/AppAppBar';
import Layout from '../components/Layout';
import Footer from '../components/Footer';

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
        {/* تحسين الأداء */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        
        {/* الخطوط العربية */}
   
        
        {/* أيقونات Material */}
        <link 
          href="https://fonts.googleapis.com/icon?family=Material+Icons" 
          rel="stylesheet" 
        />
        
        {/* Meta tags أساسية */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="color-scheme" content="light dark" />
        
        {/* معلومات أساسية محسنة للـ SEO */}
        <meta name="description" content="موقع القرآن الكريم الإلكتروني - تلاوة، تصفح، واستماع القرآن الكريم بأصوات أشهر القراء مع تصميم جميل ومتجاوب" />
        <meta name="keywords" content="القرآن الكريم, تلاوة القرآن, تصفح المصحف, استماع القرآن, القراء, تفسير, إسلام, مسلمون, قرآن إلكتروني" />
        <meta name="author" content="mohamed alromaihi" />
        <meta name="creator" content="mohamed alromaihi" />
        <meta name="publisher" content="موقع القرآن الكريم" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="language" content="Arabic" />
        <meta name="geo.region" content="SA" />
        <meta name="geo.placename" content="Saudi Arabia" />
        
        {/* Open Graph محسن للشبكات الاجتماعية */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="القرآن الكريم - الموقع الإلكتروني" />
        <meta property="og:title" content="القرآن الكريم - الموقع الإلكتروني الشامل" />
        <meta property="og:description" content="موقع شامل لتلاوة وتصفح واستماع القرآن الكريم بأفضل جودة وأسهل طريقة مع تصميم عصري ومتجاوب" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="شعار موقع القرآن الكريم" />
        <meta property="og:locale" content="ar_SA" />
        <meta property="og:locale:alternate" content="ar_AR" />
        
        {/* Twitter Card محسن */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="القرآن الكريم - الموقع الإلكتروني" />
        <meta name="twitter:description" content="موقع شامل لتلاوة وتصفح واستماع القرآن الكريم" />
        <meta name="twitter:image" content="/logo.png" />
        <meta name="twitter:image:alt" content="شعار موقع القرآن الكريم" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "القرآن الكريم",
              "alternateName": "الموقع الإلكتروني للقرآن الكريم",
              "description": "موقع شامل لتلاوة وتصفح واستماع القرآن الكريم",
              "url": process.env.NEXT_PUBLIC_BASE_URL || "https://msr-quran-app.vercel.app",
              "inLanguage": "ar",
              "author": {
                "@type": "Person",
                "name": "mohamed alromaihi",
                "email": "alromaihi2224@gmail.com"
              },
              "publisher": {
                "@type": "Organization",
                "name": "موقع القرآن الكريم",
                "logo": {
                  "@type": "ImageObject",
                  "url": "/logo.png"
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "/search/{search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* رابط canonical */}
        <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL} />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
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
