// ===================================
// src/components/AppAppBar.jsx - النسخة المحسنة مع التثبيت الدائم
// ===================================

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Logo from './Logo';

// نفس الimports الحالية - لم يتم تغييرها
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import InfoIcon from '@mui/icons-material/Info';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ErrorIcon from '@mui/icons-material/Error';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// نفس بيانات التنقل الحالية - لم يتم تغييرها
const navigationItems = [
  { 
    text: 'الصفحة الرئيسية', 
    icon: HomeIcon, 
    href: '/',
    color: '#4CAF50'
  },
  {
    text: 'تصفح المصحف',
    icon: BookIcon,
    href: '/quran-pages/1',
    color: '#2196F3'
  },
  {
    text: 'السور',
    icon: MenuBookIcon,
    href: '/quran/1',
    color: '#9C27B0'
  },
  {
    text: 'الصوتيات',
    icon: VolumeUpIcon,
    href: '/quran-sound',
    color: '#FF9800'
  },
  { 
    text: 'المصحف PDF', 
    icon: PictureAsPdfIcon, 
    href: '/quran-pdf',
    color: '#F44336'
  },
  {
    text: 'الإذاعة',
    icon: LiveTvIcon,
    href: '/live',
    color: '#E91E63'
  },
  { 
    text: 'API', 
    icon: BookIcon, 
    href: 'https://msr-quran-data.vercel.app',
    color: '#607D8B'
  },
  { 
    text: 'من نحن', 
    icon: InfoIcon, 
    href: '/about',
    color: '#795548'
  },
];

function AppAppBar() {
  // الحالات المبسطة - إزالة حالات الإخفاء التلقائي
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isVisible, setIsVisible] = useState(true); // إظهار القائمة افتراضياً
  const [shouldShakeLogo, setShouldShakeLogo] = useState(false);
  
  const router = useRouter();
  const searchInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    console.log('🚀 AppAppBar mounted');

    // التحقق من sessionStorage (يُمسح عند إغلاق التاب)
    const hasSeenMenuInThisTab = sessionStorage.getItem('hasSeenMenuInThisTab');

    if (!hasSeenMenuInThisTab) {
      // لم يرَ القائمة في هذا التاب - ابدأ الاهتزاز بعد ثانيتين
      console.log('🎯 مستخدم جديد في هذا التاب - سيبدأ الاهتزاز');
      const timer = setTimeout(() => {
        setShouldShakeLogo(true);
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []);

  // متابعة تغيير shouldShakeLogo
  useEffect(() => {
    console.log('🎯 shouldShakeLogo تغيرت إلى:', shouldShakeLogo);
    console.log('🔍 فحص العنصر...');

    setTimeout(() => {
      const logoElement = document.querySelector('.logo-menu-button');
      if (logoElement) {
        console.log('📍 العنصر موجود!');
        console.log('📝 الكلاسات:', logoElement.className);
        console.log('🎨 الأنماط:', window.getComputedStyle(logoElement).animation);
        console.log('🎯 data-shake:', logoElement.getAttribute('data-shake'));
        console.log('🎨 border:', logoElement.style.border);
      } else {
        console.log('❌ العنصر غير موجود!');
      }
    }, 100);
  }, [shouldShakeLogo]);

  // إدارة الوضع المظلم (نفس الكود الحالي)
  useEffect(() => {
    if (mounted) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
      }
    }
  }, [mounted]);

  // معالجة الأحداث (نفس المنطق الحالي)
  const toggleDarkMode = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchPath = `/search/${encodeURIComponent(searchQuery.trim())}`;
      console.log('Navigating to:', searchPath);
      router.push(searchPath);
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 300);
    }
  };

  // إضافة معالج للـ Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchExpanded]);

  const isActive = (href) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  const handleItemMouseEnter = (index) => {
    setHoveredItem(index);
  };

  const handleItemMouseLeave = () => {
    setHoveredItem(null);
  };

  // معالج مبسط لتبديل الشريط الجانبي
  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  const handleLogoClick = () => {
    console.log('🖱️ تم النقر على اللوجو - المستخدم سيرى القائمة');

    // إيقاف الاهتزاز نهائياً لهذا التاب
    setShouldShakeLogo(false);

    // حفظ أن المستخدم رأى القائمة في هذا التاب (يُمسح عند إغلاق التاب)
    sessionStorage.setItem('hasSeenMenuInThisTab', 'true');

    // فتح/إغلاق المنيو
    toggleSidebar();
  };

  if (!mounted) return null;

  return (
    <>
      {/* زر الهمبرجر الثابت */}
      <div className={`logo-menu-button ${shouldShakeLogo ? 'shake-active' : ''}`}>
        {isVisible ? (
          <div
            className="close-icon-wrapper"
            onClick={toggleSidebar}
            role="button"
            tabIndex={0}
            aria-label="إغلاق القائمة"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSidebar();
              }
            }}
          >
            <CloseIcon
            sx={{
              color: isDarkMode ? 'white' : 'black',
              fontSize: '30px',
            }}
            
            />
          </div>
        ) : (
          <div onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <Logo size={85} disableLink={true} />
          </div>
        )}
      </div>




      {/* الشريط الجانبي الثابت */}
      <div 
        className={`fixed-sidebar ${isVisible ? 'visible' : 'hidden'}`}
        role="navigation"
        aria-label="قائمة التنقل الرئيسية"
      >
        {/* قسم البحث */}
        <div className="sidebar-search-section">
          <button
            className={`search-icon-btn ${isSearchExpanded ? 'active' : ''}`}
            onClick={toggleSearch}
            aria-label={isSearchExpanded ? 'إغلاق البحث' : 'فتح البحث'}
            data-tooltip="البحث في القرآن"
          >
            {isSearchExpanded ? <CloseIcon /> : <SearchIcon />}
          </button>
        </div>

        {/* عناصر التنقل */}
        <nav className="sidebar-nav">
          {navigationItems.map((item, index) => (
            <div key={index} className="nav-item-wrapper">
              <Link
                href={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                onMouseEnter={() => handleItemMouseEnter(index)}
                onMouseLeave={handleItemMouseLeave}
                style={{
                  '--item-color': item.color,
                }}
                data-tooltip={item.text}
              >
                <item.icon className="nav-icon" />
                
                {isActive(item.href) && (
                  <div className="active-indicator" style={{ backgroundColor: item.color }} />
                )}
                
                {hoveredItem === index && (
                  <div 
                    className="glow-effect" 
                    style={{ backgroundColor: item.color + '20' }}
                  />
                )}
              </Link>
            </div>
          ))}
        </nav>

        {/* تبديل الوضع المظلم */}
        <div className="sidebar-footer">
          <button 
            className="theme-toggle-btn"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'الوضع الفاتح' : 'الوضع المظلم'}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </button>
        </div>
      </div>

      {/* Search Overlay - خارج الـ sidebar */}
      {isSearchExpanded && (
        <div
          className="search-backdrop"
          onClick={() => setIsSearchExpanded(false)}
        />
      )}
      <div className={`search-form-overlay ${isSearchExpanded ? 'expanded' : ''}`}>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="ابحث في القرآن الكريم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              dir="rtl"
            />
            <button type="submit" className="search-submit-btn">
              <SearchIcon />
            </button>
          </div>
        </form>
      </div>

      {/* الأنماط المحسنة - إزالة الحركة مع التمرير وإزالة مؤشر الإخفاء */}
      <style jsx global>{`
        /* زر اللوجو الثابت */
        .logo-menu-button {
          position: fixed;
          top: 20px;
          right: 20px; /* إعادة اللوجو إلى اليمين */
          z-index: 1001;

          /* تحسينات للشاشات الصغيرة */
          @media (max-width: 768px) {
            top: 80px; /* تحت البسملة مباشرة */
            right: 20px; /* يبقى في اليمين */
          }
          cursor: pointer;
          outline: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          /* الدائرة المحسنة مع الفلاتر */
          width: 70px;
          height: 70px;
          border-radius: 50%; /* شكل دائري مثالي */
          background: #87a8c1ed; /* خلفية بيضاء نقية */
          border: 3px solid #000000; /* بوردر أسود أسمك */
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .logo-menu-button:hover {
          border-radius: 50%; /* شكل دائري مثالي */
          background: #8a9ba8; /* لون رمادي فاتح لإبراز اللوقو */
          border: 3px solid #000000; /* بوردر أسود أسمك */
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

          /* فلاتر لإبراز اللوقو */
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        /* فلاتر إضافية للوقو لإبرازه */
        .logo-menu-button :global(.logo-img) {
          filter: brightness(1.1) contrast(1.2) saturate(1.1);
          transition: filter 0.3s ease;
        }

        .logo-menu-button:hover :global(.logo-img) {
          filter: brightness(1.5) contrast(1.3) saturate(1.2);
        }











        /* أنيميشن سريع مع توقف 4 ثوانٍ */
        .logo-menu-button.shake-active {
          animation: fastIntervalShake 5s infinite ease-in-out !important;
        }

        @keyframes fastIntervalShake {
          /* الاهتزاز السريع جداً لمدة ثانية واحدة (20% من 5 ثوانٍ) */
          0% {
            transform: scale(1) translateX(0);
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.6);
            border-radius: 45%;
          }
          1% {
            transform: scale(1.03) translateX(-1px);
            box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.4);
            border-radius: 45%;
          }
          2% {
            transform: scale(1.05) translateX(1px);
            box-shadow: 0 0 0 5px rgba(25, 118, 210, 0.3);
            border-radius: 45%;
          }
          3% {
            transform: scale(1.04) translateX(-1px);
            box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.4);
            border-radius: 45%;
          }
          4% {
            transform: scale(1.06) translateX(1px);
            box-shadow: 0 0 0 6px rgba(25, 118, 210, 0.2);
            border-radius: 45%;
          }
          5% {
            transform: scale(1.03) translateX(-1px);
            box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.4);
            border-radius: 45%;
          }
          6% {
            transform: scale(1.05) translateX(1px);
            box-shadow: 0 0 0 5px rgba(25, 118, 210, 0.3);
            border-radius: 45%;
          }
          7% {
            transform: scale(1.04) translateX(-1px);
            box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.4);
            border-radius: 45%;
          }
          8% {
            transform: scale(1.06) translateX(1px);
            box-shadow: 0 0 0 6px rgba(25, 118, 210, 0.2);
            border-radius: 45%;
          }
          9% {
            transform: scale(1.03) translateX(-1px);
            box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.4);
            border-radius: 45%;
          }
          10% {
            transform: scale(1.05) translateX(1px);
            box-shadow: 0 0 0 5px rgba(25, 118, 210, 0.3);
            border-radius: 45%;
          }
          11% {
            transform: scale(1.04) translateX(-1px);
            box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.4);
            border-radius: 45%;
          }
          12% {
            transform: scale(1.06) translateX(1px);
            box-shadow: 0 0 0 6px rgba(25, 118, 210, 0.2);
            border-radius: 45%;
          }
          13% {
            transform: scale(1.03) translateX(-1px);
            box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.4);
            border-radius: 45%;
          }
          14% {
            transform: scale(1.05) translateX(1px);
            box-shadow: 0 0 0 5px rgba(25, 118, 210, 0.3);
            border-radius: 45%;
          }
          15% {
            transform: scale(1.04) translateX(-1px);
            box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.4);
            border-radius: 45%;
          }
          16% {
            transform: scale(1.03) translateX(1px);
            box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.5);
            border-radius: 45%;
          }
          17% {
            transform: scale(1.02) translateX(-1px);
            box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.6);
            border-radius: 45%;
          }
          18% {
            transform: scale(1.01) translateX(1px);
            box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.7);
            border-radius: 45%;
          }
          20% {
            transform: scale(1) translateX(0);
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.6);
            border-radius: 45%;
          }
          /* توقف لمدة 4 ثوانٍ (80% من 5 ثوانٍ) */
          21%, 100% {
            transform: scale(1) translateX(0);
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.2);
            border-radius: 45%;
          }
        }

        @keyframes shakeMotion {
          0% { transform: translateX(0); }
          25% { transform: translateX(-1px); }
          50% { transform: translateX(1px); }
          75% { transform: translateX(-1px); }
          100% { transform: translateX(0); }
        }

        .logo-menu-button:hover {
          transform: scale(1.05);
        }

        .logo-menu-button:active {
          transform: scale(0.95);
        }

        /* ستايل الوضع المظلم للوقو */
        [data-theme="dark"] .logo-menu-button {
          background: #9ca3af; /* لون رمادي فاتح أكثر في الوضع المظلم */
          border-color: #ffffff; /* بوردر أبيض في الوضع المظلم للتباين */
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        }

        /* فلاتر إضافية في الوضع المظلم */
        [data-theme="dark"] .logo-menu-button :global(.logo-img) {
          filter: brightness(1.2) contrast(1.3) saturate(1.2);
        }

        .close-icon-wrapper {
          width: 56px;
          height: 56px;
    
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
          font-size: 24px;
          transition: all 0.3s ease;
        }

        .close-icon-wrapper:hover {
          background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
        }

        /* الشريط الجانبي الثابت */
        .fixed-sidebar {
          position: fixed;
          top: 20px;
          left: 20px; /* نقل إلى اليسار */
          height: calc(100vh - 40px); /* الطول الكامل */
          width: 90px; /* تكبير العرض */
          background: linear-gradient(
            180deg,
            rgba(104, 123, 140, 0.95) 0%,
            rgba(145, 151, 154, 0.95) 50%,
            rgba(108, 113, 117, 0.95) 100%
          );
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(52, 73, 94, 0.15);
          border: 1px solid rgba(52, 73, 94, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          transform: translateX(0);
          opacity: 1;
          overflow: visible; /* مهم جداً لظهور التلميحات */
        }

        .fixed-sidebar.visible {
          transform: translateX(0);
          opacity: 1;
        }

        .fixed-sidebar.hidden {
          transform: translateX(-120%); /* تغيير الاتجاه للإخفاء إلى اليسار */
          opacity: 0;
        }

        .sidebar-search-section {
          padding: 16px 0;
          border-bottom: 1px solid var(--border-color);
          position: relative;
        }

        .search-icon-btn {
          width: 60px; /* تكبير من 48px إلى 60px */
          height: 60px; /* تكبير من 48px إلى 60px */
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background-paper);
          border: 2px solid var(--primary-color);
          border-radius: 15px; /* تكبير border-radius */
          color: var(--primary-color);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 8px rgba(52, 73, 94, 0.1);
        }

        .search-icon-btn:hover {
          background: var(--primary-color);
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(52, 73, 94, 0.3);
        }

        .search-icon-btn.active {
          background: var(--primary-color);
          color: white;
          box-shadow: 0 4px 12px rgba(52, 73, 94, 0.3);
        }

        .search-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
          z-index: 9998;
          cursor: pointer;
        }

        .search-form-overlay {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%) scale(0.95);
          width: 500px;
          max-width: calc(100vw - 40px);
          max-height: 0;
          opacity: 0;
          visibility: hidden;
          overflow: hidden;
          background: var(--background-paper) !important;
          backdrop-filter: blur(20px);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(52, 73, 94, 0.15);
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          z-index: 9999;
          border: 1px solid var(--border-color);
        }

        .search-form-overlay.expanded {
          max-height: 200px !important;
          opacity: 1 !important;
          visibility: visible !important;
          border: 2px solid var(--primary-color) !important;
          box-shadow: 0 8px 32px rgba(52, 73, 94, 0.4) !important;
          transform: translateX(-50%) scale(1) !important;
        }

        .search-form {
          padding: 16px;
          width: 100%;
        }

        .search-input-container {
          display: flex;
          align-items: center;
          background: var(--background-paper);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(52, 73, 94, 0.1);
          border: 1px solid var(--border-color);
        }

        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--text-primary);
          font-family: var(--font-family-arabic);
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-submit-btn {
          padding: 12px;
          background: var(--primary-color);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-submit-btn:hover {
          background: var(--primary-dark);
          transform: scale(1.05);
        }

        .sidebar-nav {
          flex: 1; /* إعادة التمدد الكامل */
          padding: 15px 0; /* تكبير المساحات الداخلية */
          display: flex;
          flex-direction: column;
          gap: 12px; /* تكبير المسافة بين العناصر */
          overflow-y: auto;
          scrollbar-width: none;
        }

        .sidebar-nav::-webkit-scrollbar {
          display: none;
        }

        .nav-item-wrapper {
          position: relative;
          margin: 0 11px;
          overflow: visible; /* مهم لظهور التلميحات */
          z-index: 1001; /* ضمان ظهور التلميحات فوق العناصر الأخرى */
        }

        .nav-item {
          width: 60px; /* تكبير من 48px إلى 60px */
          height: 60px; /* تكبير من 48px إلى 60px */
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 15px; /* تكبير border-radius */
          color: rgba(52, 65, 75, 0.86);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          background: rgba(52, 73, 94, 0.05);
          backdrop-filter: blur(1px);
          border: 2px solid rgba(167, 180, 194, 0.58);
        }

        .nav-item:hover {
          color: var(--item-color);
          background: rgba(52, 73, 94, 0.15);
          transform: translateX(-2px) scale(1.05);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .nav-item.active {
          color: var(--item-color);
          background: rgba(52, 73, 94, 0.2);
          transform: translateX(-2px);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(52, 73, 94, 0.2);
        }

        .nav-icon {
          font-size: 26px !important; /* تكبير الأيقونات */
          transition: all 0.3s ease;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }

        .active-indicator {
          position: absolute;
          left: -11px; /* تغيير من right إلى left */
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 0 2px 2px 0; /* تغيير border-radius للجهة اليسرى */
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            left: -20px; /* تغيير من right إلى left */
            opacity: 0;
          }
          to {
            left: -11px; /* تغيير من right إلى left */
            opacity: 1;
          }
        }

        .glow-effect {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 14px;
          z-index: -1;
          animation: glow 0.3s ease;
        }

        @keyframes glow {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* tooltip عام لكل عناصر التنقل - نفس طريقة زر الثيم */
        .nav-item-wrapper {
          position: relative;
        }
        
        .nav-item[data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          left: 75px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%);
          color: white;
          padding: 10px 15px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          z-index: 9999;
          backdrop-filter: blur(15px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif;
          animation: tooltipAppear 0.3s ease-out;
        }

        .nav-item[data-tooltip]:hover::before {
          content: '';
          position: absolute;
          left: 67px;
          top: 50%;
          transform: translateY(-50%);
          border: 8px solid transparent;
          border-right-color: rgba(0, 0, 0, 0.95);
          z-index: 10000;
        }

        @keyframes tooltipAppear {
          0% {
            opacity: 0;
            transform: translateY(-50%) translateX(0px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) translateX(10px) scale(1);
          }
        }

        .sidebar-footer {
          padding: 16px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .theme-toggle-btn {
          width: 60px; /* تكبير من 48px إلى 60px */
          height: 60px; /* تكبير من 48px إلى 60px */
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 15px; /* تكبير border-radius */
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .theme-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        /* الوضع المظلم */
        [data-theme="dark"] .fixed-sidebar {
          background: linear-gradient(
            180deg,
            rgba(18, 18, 18, 0.95) 0%,
            rgba(30, 30, 30, 0.95) 50%,
            rgba(42, 42, 42, 0.95) 100%
          );
          border-left-color: rgba(255, 255, 255, 0.05);
        }

        [data-theme="dark"] .search-form-overlay {
          background: rgba(30, 30, 30, 0.95);
          border-color: rgba(255, 255, 255, 0.1);
        }

        [data-theme="dark"] .search-input-container {
          background: #2d2d2d;
        }

        [data-theme="dark"] .search-input {
          color: #e0e0e0;
        }

        /* إزالة البوردر من الأزرار في الوضع المظلم */
        [data-theme="dark"] .nav-item {
          border: none;
        }

        [data-theme="dark"] .nav-item {
          border: none;
        }

        /* الاستجابة للشاشات المختلفة */
        @media (max-width: 480px) {
          .fixed-sidebar {
            width: 60px;
            left: 15px; /* القائمة في اليسار */
          }
          
          .logo-menu-button {
            top: 15px;
            right: 15px; /* اللوجو في اليمين */
          }

          .close-icon-wrapper {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
          
          .nav-item,
          .search-icon-btn,
          .theme-toggle-btn {
            width: 40px;
            height: 40px;
          }
          
          .search-form-overlay {
            width: calc(100vw - 20px);
            max-width: calc(100vw - 20px);
            top: 10px;
          }
        }

        /* الشاشات الصغيرة جداً */
        @media (max-width: 360px) {
          .logo-menu-button {
            top: 10px;
            right: 10px; /* اللوجو في اليمين */
          }

          .fixed-sidebar {
            left: 10px; /* القائمة في اليسار */
          }

          .close-icon-wrapper {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .search-form-overlay {
            width: 350px;
            right: 60px;
          }
        }

        /* تحسينات الأداء */
        .fixed-sidebar,
        .logo-menu-button {
          contain: layout style paint;
        }

        /* tooltip خاص بزر البحث - نفس طريقة باقي الأزرار */
        .search-icon-btn[data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          left: 75px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%);
          color: white;
          padding: 10px 15px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          z-index: 9999;
          backdrop-filter: blur(15px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif;
          animation: tooltipAppear 0.3s ease-out;
        }

        .search-icon-btn[data-tooltip]:hover::before {
          content: '';
          position: absolute;
          left: 67px;
          top: 50%;
          transform: translateY(-50%);
          border: 8px solid transparent;
          border-right-color: rgba(0, 0, 0, 0.95);
          z-index: 10000;
        }

        /* tooltip خاص بزر الثيم */
        .theme-toggle-btn {
          position: relative;
        }

        .theme-toggle-btn:hover::after {
          content: 'تبديل الوضع المظلم/الفاتح';
          position: absolute;
          left: 75px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%);
          color: white;
          padding: 10px 15px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          z-index: 1002;
          backdrop-filter: blur(15px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif;
          animation: tooltipAppear 0.3s ease-out;
        }

        .theme-toggle-btn:hover::before {
          content: '';
          position: absolute;
          left: 67px;
          top: 50%;
          transform: translateY(-50%);
          border: 8px solid transparent;
          border-right-color: rgba(0, 0, 0, 0.95);
          z-index: 1003;
        }

        /* تحسينات إمكانية الوصول */
        @media (prefers-reduced-motion: reduce) {
          .fixed-sidebar,
          .nav-item,
          .search-form-overlay,
          .tooltip,
          .glow-effect,
          .active-indicator {
            transition: none;
            animation: none;
          }
        }

        /* إخفاء AppAppBar في وضع الشاشة الكاملة */
        body.quran-fullscreen .logo-menu-button,
        body.quran-fullscreen .fixed-sidebar {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </>
  );
}

export default AppAppBar;