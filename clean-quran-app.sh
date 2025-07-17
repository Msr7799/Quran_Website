#!/bin/bash

# Clean Project Script - تنظيف المشروع من الملفات غير المستخدمة
# Usage: chmod +x clean-project.sh && ./clean-project.sh

echo "🧹 بدء تنظيف مشروع القرآن الكريم..."

# إنشاء نسخة احتياطية
echo "📦 إنشاء نسخة احتياطية..."
mkdir -p ./backup/$(date +%Y%m%d_%H%M%S)
cp -r ./src ./backup/$(date +%Y%m%d_%H%M%S)/

# الملفات والمجلدات المراد حذفها
echo "🗑️ حذف الملفات غير المستخدمة..."

# حذف ملفات التطوير غير المستخدمة
rm -f .eslintrc.json  # استبداله بإعدادات مدمجة في next.config.mjs
rm -f jsconfig.json   # نستخدم tsconfig.json

# حذف المكونات غير المستخدمة أو المكررة
echo "🔧 حذف المكونات غير المستخدمة..."

# المكونات المكررة أو غير المستخدمة
rm -f src/components/DribbbleShot.jsx     # مكون تجريبي
rm -f src/components/Header.jsx           # استبدل بـ AppAppBar
rm -f src/components/SideBar.jsx          # استبدل بـ AppAppBar
rm -f src/components/MakkahLive.jsx       # مدمج في live.jsx
rm -f src/components/QariAudioPlayer.jsx  # استبدل بـ QuranAudioIndex
rm -f src/components/AudioPlayer.jsx      # استبدل بـ EnhancedAudioPlayer

# حذف ملفات الـ utility غير المستخدمة
rm -f src/utils/zoomFix.js               # مدمج في globals.css

# حذف صفحات تجريبية
rm -f src/pages/quran-sound/reciters.jsx # مدمج في index
rm -f src/pages/quran/index.jsx          # redirect بسيط

# حذف ملفات CSS مكررة
rm -f src/styles/zoom-fix-simple.css     # مدمج في globals.css
rm -f src/styles/variables.css           # استبدل بـ theme system

# حذف ملفات الثيم المكررة
rm -f src/components/ThemeContext.tsx    # استبدل بـ MUI theme
rm -f src/components/ThemeSync.tsx       # غير مستخدم

# حذف أيقونات مكررة
rm -f src/components/IconAlnuzul.jsx     # يمكن استخدام MUI icons

# حذف scripts التطوير
rm -rf scripts/

echo "📝 تحديث الملفات المتبقية..."

# تحديث package.json - إزالة dependencies غير المستخدمة
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
    "next": "14.2.21",
    "react": "^18",
    "react-dom": "^18",
    "react-icons": "^5.3.0",
    "react-audio-player": "^0.17.0"
  },
  "devDependencies": {
    "eslint": "^8.52.0",
    "eslint-config-next": "14.2.7",
    "typescript": "^5.8.3"
  },
  "type": "module"
}
EOF

echo "✨ إنشاء ملف إعدادات responsive محسن..."

# إنشاء ملف responsive utilities
mkdir -p src/styles/utils
cat > src/styles/utils/responsive.css << 'EOF'
/* Responsive Utilities - محسنة للقرآن الكريم */

:root {
  /* Responsive Breakpoints */
  --mobile-small: 320px;
  --mobile: 480px;
  --tablet: 768px;
  --desktop: 1024px;
  --desktop-large: 1200px;
  
  /* Responsive Spacing */
  --spacing-xs: clamp(0.25rem, 1vw, 0.5rem);
  --spacing-sm: clamp(0.5rem, 2vw, 1rem);
  --spacing-md: clamp(1rem, 3vw, 2rem);
  --spacing-lg: clamp(1.5rem, 4vw, 3rem);
  --spacing-xl: clamp(2rem, 5vw, 4rem);
  
  /* Responsive Font Sizes */
  --font-size-xs: clamp(0.75rem, 2vw, 0.875rem);
  --font-size-sm: clamp(0.875rem, 2.5vw, 1rem);
  --font-size-base: clamp(1rem, 3vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 3.5vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 4vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 5vw, 2rem);
  --font-size-3xl: clamp(2rem, 6vw, 3rem);
}

/* Container Responsive */
.container-responsive {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-sm);
}

@media (min-width: 768px) {
  .container-responsive {
    padding: 0 var(--spacing-md);
  }
}

/* Grid System Responsive */
.grid-responsive {
  display: grid;
  gap: var(--spacing-sm);
  grid-template-columns: 1fr;
}

@media (min-width: 480px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Typography Responsive */
.text-responsive {
  font-size: var(--font-size-base);
  line-height: 1.6;
}

.heading-responsive {
  font-size: var(--font-size-2xl);
  line-height: 1.2;
  margin-bottom: var(--spacing-md);
}

/* Button Responsive */
.button-responsive {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .button-responsive {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-base);
  }
}

/* Card Responsive */
.card-responsive {
  background: var(--card-bg);
  border-radius: 12px;
  padding: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.card-responsive:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Navigation Responsive */
.nav-responsive {
  display: none;
}

@media (max-width: 767px) {
  .nav-mobile {
    display: block;
  }
  
  .nav-desktop {
    display: none;
  }
}

@media (min-width: 768px) {
  .nav-responsive {
    display: flex;
  }
  
  .nav-mobile {
    display: none;
  }
}

/* Sidebar Responsive */
.sidebar-responsive {
  position: fixed;
  top: 0;
  right: 0;
  width: 60px;
  height: 100vh;
  z-index: 1000;
  transition: width 0.3s ease;
}

@media (min-width: 768px) {
  .sidebar-responsive {
    width: 80px;
  }
}

/* Hide elements on mobile */
@media (max-width: 767px) {
  .hide-mobile {
    display: none !important;
  }
}

/* Hide elements on desktop */
@media (min-width: 768px) {
  .hide-desktop {
    display: none !important;
  }
}

/* Responsive Images */
.image-responsive {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* Responsive Tables */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-responsive table {
  min-width: 600px;
}

@media (max-width: 767px) {
  .table-responsive table {
    font-size: 0.875rem;
  }
}
EOF

echo "🎨 إنشاء ملف CSS محسن للمكونات..."

cat > src/styles/components.css << 'EOF'
/* Components Styles - محسنة وموحدة */

/* Quran Card Component */
.quran-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: clamp(1rem, 3vw, 2rem);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.quran-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.quran-card-title {
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

/* Audio Player Component */
.audio-player-container {
  background: var(--card-bg);
  border-radius: 16px;
  padding: clamp(1rem, 3vw, 2rem);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--primary-color);
  margin: 2rem 0;
}

.audio-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.5rem, 2vw, 1rem);
  flex-wrap: wrap;
}

.audio-button {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: clamp(40px, 8vw, 60px);
  height: clamp(40px, 8vw, 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.audio-button:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

/* Search Component */
.search-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto 2rem;
}

.search-input {
  width: 100%;
  padding: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  border: 2px solid var(--border-color);
  border-radius: 25px;
  background: var(--card-bg);
  transition: all 0.3s ease;
  text-align: right;
  direction: rtl;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
}

/* Navigation Component */
.navigation-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(1rem, 3vw, 2rem);
  background: var(--card-bg);
  border-radius: 16px;
  margin: 2rem 0;
}

.nav-button {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  padding: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.nav-button:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  transform: none;
}

/* Carousel Component */
.carousel-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.carousel-slide {
  padding: clamp(1rem, 3vw, 2rem);
  text-align: center;
}

.carousel-content {
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  line-height: 1.8;
  color: var(--text-primary);
}

/* Footer Component */
.footer-container {
  background: var(--card-bg);
  padding: clamp(2rem, 5vw, 4rem) 0;
  margin-top: 4rem;
  border-top: 1px solid var(--border-color);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 2rem);
  text-align: center;
}

/* Responsive Utilities for Components */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-stack {
    flex-direction: column !important;
    gap: 1rem !important;
  }
  
  .mobile-full-width {
    width: 100% !important;
  }
  
  .mobile-center {
    text-align: center !important;
  }
}

@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-only {
    display: block !important;
  }
}
EOF

echo "🔧 تحديث ملف globals.css لإزالة مشاكل الـ scaling..."

# إنشاء نسخة محسنة من globals.css
cat > src/styles/globals-fixed.css << 'EOF'
/* Global Styles - Fixed Version بدون مشاكل التحجيم */

@import './utils/responsive.css';
@import './components.css';

/* إعادة تعيين أساسية */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
  height: 100%;
}

body {
  font-family: 'Inter', 'Cairo', 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--background-color);
  min-height: 100vh;
  overflow-x: hidden;
  /* إزالة أي تحجيم قسري */
  transform: none !important;
  zoom: 1 !important;
  scale: 1 !important;
}

#__next {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* إزالة التحجيم */
  transform: none !important;
  zoom: 1 !important;
}

/* متغيرات CSS للألوان */
:root {
  --primary-color: #1976d2;
  --primary-dark: #1565c0;
  --secondary-color: #dc004e;
  --background-color: #f5f5f5;
  --card-bg: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
}

[data-theme="dark"] {
  --background-color: #121212;
  --card-bg: #1e1e1e;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --border-color: #333333;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 1rem;
}

h1 { font-size: clamp(2rem, 5vw, 3rem); }
h2 { font-size: clamp(1.5rem, 4vw, 2.5rem); }
h3 { font-size: clamp(1.25rem, 3vw, 2rem); }
h4 { font-size: clamp(1.125rem, 2.5vw, 1.5rem); }

p {
  margin-bottom: 1rem;
  font-size: clamp(1rem, 2vw, 1.125rem);
}

/* Links */
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* Lists */
ul, ol {
  padding-left: 2rem;
  margin-bottom: 1rem;
}

li {
  margin-bottom: 0.5rem;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* Forms */
input, textarea, select {
  font-family: inherit;
  font-size: 1rem;
  padding: 0.75rem;
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

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Utilities */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 2rem; }

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }

.p-1 { padding: 0.5rem; }
.p-2 { padding: 1rem; }
.p-3 { padding: 1.5rem; }
.p-4 { padding: 2rem; }

/* Flexbox Utilities */
.d-flex { display: flex; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.flex-column { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }

/* Grid Utilities */
.d-grid { display: grid; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.gap-1 { gap: 0.5rem; }
.gap-2 { gap: 1rem; }
.gap-3 { gap: 1.5rem; }

/* Width & Height */
.w-100 { width: 100%; }
.h-100 { height: 100%; }
.max-w-container { max-width: 1200px; margin: 0 auto; }

/* Shadows */
.shadow-sm { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
.shadow-md { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); }

/* Animation */
.transition { transition: all 0.3s ease; }
.scale-hover:hover { transform: scale(1.05); }
.translate-hover:hover { transform: translateY(-2px); }

/* Responsive */
@media (max-width: 768px) {
  .grid-3 { grid-template-columns: 1fr; }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-2 { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .grid-4 { grid-template-columns: 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus indicators */
*:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Loading states */
.loading {
  opacity: 0.7;
  pointer-events: none;
}

.spinner {
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
EOF

echo "📋 إنشاء قائمة الملفات التي تم تنظيفها..."

cat > ./cleanup-report.md << 'EOF'
# تقرير تنظيف مشروع القرآن الكريم

## الملفات المحذوفة ✅

### إعدادات غير مستخدمة
- `.eslintrc.json` - مدمج في next.config.mjs
- `jsconfig.json` - نستخدم tsconfig.json

### مكونات مكررة/غير مستخدمة
- `DribbbleShot.jsx` - مكون تجريبي
- `Header.jsx` - استبدل بـ AppAppBar
- `SideBar.jsx` - استبدل بـ AppAppBar  
- `MakkahLive.jsx` - مدمج في live.jsx
- `QariAudioPlayer.jsx` - استبدل بـ QuranAudioIndex
- `AudioPlayer.jsx` - استبدل بـ EnhancedAudioPlayer
- `IconAlnuzul.jsx` - يمكن استخدام MUI icons

### ملفات CSS مكررة
- `zoom-fix-simple.css` - مدمج في globals.css
- `variables.css` - استبدل بـ theme system

### مكونات الثيم المكررة
- `ThemeContext.tsx` - استبدل بـ MUI theme
- `ThemeSync.tsx` - غير مستخدم

### صفحات مكررة
- `quran-sound/reciters.jsx` - مدمج في index
- `quran/index.jsx` - redirect بسيط

### ملفات utility غير مستخدمة
- `zoomFix.js` - مدمج في globals.css
- `scripts/` - مجلد التطوير

## الملفات الجديدة/المحسنة 🆕

### ملفات CSS محسنة
- `src/styles/utils/responsive.css` - utilities للاستجابة
- `src/styles/components.css` - styles المكونات الموحدة
- `src/styles/globals-fixed.css` - نسخة محسنة من globals

### package.json محسن
- إزالة dependencies غير مستخدمة
- تبسيط البنية

## التحسينات المطلوبة 🔧

### 1. إصلاح Layout.jsx
إزالة التحجيم القسري:
```jsx
// إزالة هذا
transform: `scale(${getScale()})`,

// واستبداله بـ responsive CSS
```

### 2. تحسين القائمة الجانبية
- استخدام CSS Grid/Flexbox
- تحسين الاستجابة للشاشات الصغيرة

### 3. تحسين المكونات
- استخدام clamp() للخطوط
- استخدام CSS variables
- تحسين الـ mobile navigation

## الخطوات التالية 📝

1. استبدال `globals.css` بـ `globals-fixed.css`
2. تطبيق الـ responsive utilities الجديدة
3. إزالة التحجيم من Layout.jsx
4. تحديث المكونات لاستخدام الـ CSS الجديد
5. اختبار على مختلف الشاشات

## نصائح التطوير 💡

1. استخدم CSS Grid للتخطيطات المعقدة
2. استخدم Flexbox للتخطيطات البسيطة
3. استخدم clamp() للأحجام المتغيرة
4. اختبر على Chrome DevTools بأحجام مختلفة
5. استخدم Mobile-first approach

EOF

echo "✅ تم الانتهاء من تنظيف المشروع!"
