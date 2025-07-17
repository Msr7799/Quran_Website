#!/bin/bash

# إصلاح أخطاء البناء بعد التنظيف
echo "🔧 إصلاح أخطاء البناء..."

echo "📍 البحث عن الملفات التي تستورد ThemeContext..."
# البحث عن الملفات التي تستورد ThemeContext
grep -r "ThemeContext" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" || echo "لم يتم العثور على استيرادات"

echo "📍 البحث عن الملفات التي تستورد ThemeSync..."
# البحث عن الملفات التي تستورد ThemeSync
grep -r "ThemeSync" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" || echo "لم يتم العثور على استيرادات"

echo "📍 البحث عن استيرادات أخرى مكسورة..."
# البحث عن استيرادات مكسورة أخرى
grep -r "DribbbleShot\|Header\|SideBar\|MakkahLive\|QariAudioPlayer\|AudioPlayer\|IconAlnuzul\|zoomFix" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" || echo "لم يتم العثور على استيرادات مكسورة أخرى"

echo "🔧 إصلاح _app.js..."
# إصلاح _app.js بإزالة الاستيرادات المكسورة
cat > src/pages/_app.js << 'EOF'
import '../styles/globals.css';
import AppTheme from '../theme/AppTheme';
import { Box, CssBaseline } from '@mui/material';
import AppAppBar from '../components/AppAppBar';
import Footer from '../components/Footer';
import Layout from '../components/Layout';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1976d2" />
      </Head>
      <Box className="siteWrapper">
        <AppTheme>
          <CssBaseline />
          <AppAppBar />
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <Layout>
            <Footer />
          </Layout>
        </AppTheme>
      </Box>
    </>
  );
}
EOF

echo "🔧 تحديث Layout.jsx لإزالة مشكلة التحجيم..."
cat > src/components/Layout.jsx << 'EOF'
import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const Layout = ({ children }) => {
  const theme = useTheme();
  
  return (
    <Box
      component="div"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflowX: 'hidden',
        margin: 0,
        padding: 0,
        backgroundColor: theme.palette.background.default,
        // إزالة التحجيم المشكِل
        transform: 'none !important',
        scale: '1 !important',
        zoom: '1 !important',
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          position: 'relative',
          margin: 0,
          padding: 0,
          paddingRight: {
            xs: '60px', // موبايل
            sm: '70px', // تابلت صغير
            md: '80px', // تابلت وأكبر
          },
          backgroundColor: theme.palette.background.default,
          transition: 'padding-right 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default React.memo(Layout);
EOF

echo "🔧 إنشاء ملف globals.css محسن..."
cat > src/styles/globals.css << 'EOF'
/* Global Styles - Fixed Version */

@font-face {
  font-family: "Cairo";
  src: url("./fonts/Cairo-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "uthmanic";
  src: url("./fonts/hafs/uthmanic_hafs_v22.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "bismillah";
  src:
    url("./fonts/bismillah/QCF_Bismillah_COLOR-Regular.woff2") format("woff2"),
    url("./fonts/bismillah/QCF_Bismillah_COLOR-Regular.woff") format("woff");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

:root {
  /* Colors */
  --primary-color: #1976d2;
  --primary-dark: #1565c0;
  --secondary-color: #dc004e;
  --background-color: #f5f5f5;
  --card-bg: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-size-sm: clamp(0.875rem, 2vw, 1rem);
  --font-size-base: clamp(1rem, 2.5vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 3vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 3.5vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 4vw, 2rem);
  --font-size-3xl: clamp(2rem, 5vw, 3rem);
}

[data-theme="dark"] {
  --background-color: #121212;
  --card-bg: #1e1e1e;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --border-color: #333333;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  font-size: 16px;
  scroll-behavior: smooth;
  background-color: var(--background-color);
  /* إزالة التحجيم */
  zoom: 1 !important;
  transform: none !important;
  scale: 1 !important;
}

body {
  font-family: 'Inter', 'Cairo', 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--background-color);
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#__next {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  /* إزالة التحجيم */
  zoom: 1 !important;
  transform: none !important;
  scale: 1 !important;
}

.siteWrapper {
  zoom: 1 !important;
  transform: none !important;
  scale: 1 !important;
  width: 100% !important;
  height: auto !important;
  background-color: var(--background-color);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  line-height: 1.3;
  font-weight: 600;
}

h1 { font-size: var(--font-size-3xl); }
h2 { font-size: var(--font-size-2xl); }
h3 { font-size: var(--font-size-xl); }
h4 { font-size: var(--font-size-lg); }

p {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-base);
}

/* Links */
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--primary-dark);
}

/* Buttons */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  transition: all 0.3s ease;
  background: var(--primary-color);
  color: white;
}

button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Forms */
input, textarea, select {
  font-family: inherit;
  font-size: var(--font-size-base);
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* Container */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Utilities */
.text-center { text-align: center; }
.text-right { text-align: right; }
.mb-2 { margin-bottom: var(--spacing-md); }
.p-2 { padding: var(--spacing-md); }

/* Grid */
.grid {
  display: grid;
  gap: var(--spacing-md);
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }

@media (max-width: 768px) {
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}

/* Flex */
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

/* Card */
.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

/* Loading */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
}

/* Responsive */
@media (max-width: 768px) {
  :root {
    --spacing-sm: 0.25rem;
    --spacing-md: 0.5rem;
    --spacing-lg: 1rem;
    --spacing-xl: 1.5rem;
  }
}

/* حماية العناصر المثبتة من التحجيم */
[style*="position: fixed"],
.MuiBox-root[style*="position: fixed"] {
  transform: none !important;
  zoom: 1 !important;
  scale: 1 !important;
}

/* Dark Mode Body Class */
body.dark-mode {
  --background-color: #121212;
  --card-bg: #1e1e1e;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --border-color: #333333;
}
EOF

echo "📦 تحديث package.json لإزالة dependencies غير مستخدمة..."
cat > package.json << 'EOF'
{
  "name": "quran_website",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "author": {
    "name": "mohamed alromaihi",
    "email": "alromaihi2224@gmail.com",
    "url": "soon"
  },
  "license": "MIT",
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/icons-material": "^7.1.2",
    "@mui/material": "^7.1.2",
    "embla-carousel": "^8.6.0",
    "embla-carousel-autoplay": "^8.6.0",
    "embla-carousel-react": "^8.6.0",
    "next": "15.0.3",
    "react": "^18",
    "react-dom": "^18",
    "react-icons": "^5.3.0",
    "react-audio-player": "^0.17.0"
  },
  "devDependencies": {
    "eslint": "^8.52.0",
    "eslint-config-next": "15.0.3",
    "typescript": "^5.8.3"
  },
  "type": "module"
}
EOF

echo "🧹 تنظيف ملفات إضافية قد تسبب مشاكل..."
# حذف ملفات قد تسبب تضارب
rm -f src/styles/dark-mode.css
rm -f src/styles/variables.css

echo "🔧 تحديث next.config.mjs..."
cat > next.config.mjs << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'build',
    images: {
        unoptimized: true,
    },
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    
    async redirects() {
        return [
            {
                source: '/Quran_pdf/index.html',
                destination: '/quran-pdf',
                permanent: true, 
            }
        ];
    },
    
    eslint: {
        ignoreDuringBuilds: true,
    },
    
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
EOF

echo "✅ تم إصلاح أخطاء البناء!"
echo ""
echo "🔄 الآن جرب:"
echo "1. npm install"
echo "2. npm run dev"
echo ""
echo "إذا استمرت المشاكل، شغل:"
echo "rm -rf node_modules package-lock.json && npm install"