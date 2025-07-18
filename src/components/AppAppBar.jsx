// ===================================
// src/components/AppAppBar.jsx - النسخة المحسنة مع التثبيت الدائم
// ===================================

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

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
import MenuIcon from '@mui/icons-material/Menu';

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
    color: '#9C27B0'
  },
  { 
    text: 'API', 
    icon: BookIcon, 
    href: 'https://quran-api-qklj.onrender.com/docs',
    color: '#607D8B'
  },
  { 
    text: 'من نحن', 
    icon: InfoIcon, 
    href: '/about',
    color: '#795548'
  },
  { 
    text: 'صفحة الخطأ', 
    icon: ErrorIcon, 
    href: '/404',
    color: '#E91E63'
  },
];

function AppAppBar() {
  // الحالات المبسطة - إزالة حالات الإخفاء التلقائي
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const router = useRouter();
  const searchInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

  if (!mounted) return null;

  return (
    <>
      {/* زر الهمبرجر الثابت */}
      <button 
        className="hamburger-button"
        onClick={toggleSidebar}
        aria-label={isVisible ? 'إغلاق القائمة' : 'فتح القائمة'}
      >
        {isVisible ? <CloseIcon /> : <MenuIcon />}
      </button>

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
          >
            {isSearchExpanded ? <CloseIcon /> : <SearchIcon />}
          </button>
          
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
              
              <div 
                className={`tooltip ${hoveredItem === index ? 'visible' : ''}`}
              >
                {item.text}
              </div>
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

      {/* الأنماط المحسنة - إزالة الحركة مع التمرير وإزالة مؤشر الإخفاء */}
      <style jsx global>{`
        /* زر الهمبرجر الثابت */
        .hamburger-button {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1001;
          width: 56px;
          height: 56px;
          border: none;
          border-radius: 50%;
          background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 24px;
        }

        .hamburger-button:hover {
          background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
        }

        .hamburger-button:active {
          transform: scale(0.95);
        }

        /* الشريط الجانبي الثابت */
        .fixed-sidebar {
          position: fixed;
          top: 20px;
          right: 90px;
          height: calc(100vh - 40px);
          width: 70px;
          background: linear-gradient(
            180deg,
            rgba(25, 118, 210, 0.95) 0%,
            rgba(21, 101, 192, 0.95) 50%,
            rgba(13, 71, 161, 0.95) 100%
          );
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          box-shadow: 
            -4px 0 20px rgba(0, 0, 0, 0.1),
            inset 1px 0 0 rgba(255, 255, 255, 0.1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform: translateX(120%);
          opacity: 0;
        }

        .fixed-sidebar.visible {
          transform: translateX(0);
          opacity: 1;
        }

        .fixed-sidebar.hidden {
          transform: translateX(120%);
          opacity: 0;
        }

        .sidebar-search-section {
          padding: 16px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .search-icon-btn {
          width: 48px;
          height: 48px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .search-icon-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .search-form-overlay {
          position: absolute;
          top: 50%;
          right: 80px;
          transform: translateY(-50%);
          width: 300px;
          max-height: 0;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          z-index: 1001;
        }

        .search-form-overlay.expanded {
          max-height: 80px;
          border: 1px solid rgba(25, 118, 210, 0.3);
        }

        .search-form {
          padding: 12px;
        }

        .search-input-container {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: transparent;
          font-size: 14px;
          color: #333;
          font-family: 'Cairo', sans-serif;
          outline: none;
        }

        .search-input::placeholder {
          color: #999;
        }

        .search-submit-btn {
          padding: 12px;
          background: #1976d2;
          border: none;
          color: white;
          cursor: pointer;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .sidebar-nav::-webkit-scrollbar {
          display: none;
        }

        .nav-item-wrapper {
          position: relative;
          margin: 0 11px;
        }

        .nav-item {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }

        .nav-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.15);
          transform: translateX(-2px) scale(1.05);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .nav-item.active {
          color: white;
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(-2px);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .nav-icon {
          font-size: 22px !important;
          transition: all 0.3s ease;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }

        .active-indicator {
          position: absolute;
          right: -11px;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 2px 0 0 2px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            right: -20px;
            opacity: 0;
          }
          to {
            right: -11px;
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

        .tooltip {
          position: absolute;
          right: 60px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1002;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tooltip:before {
          content: '';
          position: absolute;
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-left-color: rgba(0, 0, 0, 0.9);
        }

        .tooltip.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(-8px);
        }

        .sidebar-footer {
          padding: 16px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .theme-toggle-btn {
          width: 48px;
          height: 48px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 12px;
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

        /* الاستجابة للشاشات المختلفة */
        @media (max-width: 480px) {
          .fixed-sidebar {
            width: 60px;
            right: 80px;
          }
          
          .hamburger-button {
            top: 15px;
            right: 15px;
            width: 48px;
            height: 48px;
          }
          
          .nav-item,
          .search-icon-btn,
          .theme-toggle-btn {
            width: 40px;
            height: 40px;
          }
          
          .search-form-overlay {
            width: 250px;
            right: 70px;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .search-form-overlay {
            width: 280px;
          }
        }

        /* تحسينات الأداء */
        .fixed-sidebar,
        .hamburger-button {
          contain: layout style paint;
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
      `}</style>
    </>
  );
}

export default AppAppBar;