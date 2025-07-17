import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { createPortal } from 'react-dom';
// Icons
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import InfoIcon from '@mui/icons-material/Info';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ErrorIcon from '@mui/icons-material/Error';
import MenuIcon from '@mui/icons-material/Menu';

import ColorModeIconDropdown from '../theme/ColorModeIconDropdown';

const SIDEBAR_WIDTH = 80;

// Styled Components
const SidebarContainer = styled('div')(({ theme }) => ({
  position: 'fixed !important',
  top: '0px !important',
  right: '0 !important',
  width: '80px !important',
  height: '100vh !important',
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #460601B5 0%, #070615FF 100%)'
    : 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
  zIndex: '10000 !important', // زيادة z-index لضمان الظهور فوق كل شيء
  display: 'flex !important',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '25px 15px !important',
  paddingTop: '5px',
  boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(10px)',
  overflowY: 'auto',
  overflowX: 'hidden',
  // منع جميع أنواع التحويلات
  transform: 'none !important',
  transformOrigin: 'center center !important',
  scale: '1 !important',
  zoom: '1 !important',
  // إضافة للتأكد من عدم تأثر القائمة بأي CSS من العناصر الأب
  isolation: 'isolate',
  contain: 'layout style paint',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '@media (max-width: 768px)': {
    width: '60px !important',
  },
  // منع تأثير أي تحويلات من العناصر الأب على الأطفال
  '& *': {
    transform: 'none !important',
    scale: '1 !important',
  },
}));

const SidebarIcon = styled(IconButton)(({ theme }) => ({
  width: 45,
  height: 38,
  marginBottom: '7px !important',

  color: 'rgba(255,255,255,0.7)',
  backgroundColor: 'transparent',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    transform: 'scale(1.05)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '20px',
  },
  '&.active': {
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
  }
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed !important',
  top: '10px !important',
  right: '10px !important', 
  width: '50px',
  height: '50px',
  zIndex: '1300 !important',
  color: '#fff',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  transform: 'none !important',
  zoom: '1 !important',
  display: 'none',
}));

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'fixed !important',
  top: '75px !important',
  right: '75px !important',
  height: '50px',
  backgroundColor: '',
  borderRadius: '25px',
  borderEndRadius: '0',
  borderEndStartRadius: '0',
  borderTopRightRadius: '0',
  display: 'flex',
  border: '2px solid orange',
  alignItems: 'center',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  zIndex: '2100 !important',
  backdropFilter: 'blur(10px)',
  transform: 'none !important',
  transformOrigin: 'center center !important',
  scale: '1 !important',
  zoom: '1 !important',
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  padding: '0 20px',
  color: '#1b1b1b',
  fontSize: '16px',
  '& .MuiInputBase-input': {
    '&::placeholder': {
      color: '#666',
      opacity: 1,
    },
  },
}));

const SearchButton = styled(IconButton)(({ theme }) => ({
  padding: '10px',
  color: '#DBCDCDFF !important',
  backgroundColor: '#0E0F18FF !important',
  '&:hover': {
    backgroundColor:'#02020DFF !important',
    color: '#fff !important',
    transform: 'scale(1.05)',
  },
}));

const ThemeToggleContainer = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  marginBottom: '20px',
}));


const navigationItems = [
  { text: 'الصفحة الرئيسية', icon: HomeIcon, href: '/' },
  { text: 'تصفح المصحف', icon: BookIcon, href: '/quran-pages/1' },
  { text: 'الصوتيات', icon: VolumeUpIcon, href: '/quran-sound' },
  { text: 'المصحف PDF', icon: PictureAsPdfIcon, href: '/quran-pdf' },
  { text: 'الإذاعة', icon: LiveTvIcon, href: '/live' },
  { text: 'API', icon: BookIcon, href: 'https://quran-api-qklj.onrender.com/docs' },
  { text: 'من نحن', icon: InfoIcon, href: '/about' },
  { text: 'صفحة الخطأ', icon: ErrorIcon, href: '/404' },
];

function AppAppBarContent() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // تغيير إلى true لتظهر دائماً
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const searchInputRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const sidebarRef = useRef(null);

  // للتأكد من أن الكومبوننت محمل في الClient side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función para manejar el toggle del menú
  const handleMenuToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
    resetInactivityTimer();
  };

  // Función para manejar el toggle de la búsqueda
  const handleSearchToggle = () => {
    setSearchExpanded(!searchExpanded);
    resetInactivityTimer();
    
    // Focus on search input when expanded
    if (!searchExpanded) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 300);
    }
  };

  // Detectar clics en el icono de búsqueda
  const handleSearchIconClick = (e) => {
    e.preventDefault();
    handleSearchToggle();
  };

  // Restablecer el temporizador de inactividad
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    inactivityTimerRef.current = setTimeout(() => {
      if (sidebarExpanded) {
        setSidebarExpanded(false);
      }
    }, 15000); // 15 segundos
  };

  // Detectar movimiento del mouse o interacción con el teclado para restablecer el temporizador
  useEffect(() => {
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Eventos para detectar actividad del usuario
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    // Iniciar el temporizador
    resetInactivityTimer();

    return () => {
      // Limpiar los event listeners y el temporizador al desmontar
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [sidebarExpanded]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // استخدام الروت الصحيح للبحث
      router.push(`/search/${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchExpanded(false);
    }
  };

  const handleSearchClickAway = () => {
    if (searchExpanded && !searchQuery.trim()) {
      setSearchExpanded(false);
    }
  };

  const isActive = (href) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  // إنشاء المحتوى
  const sidebarContent = (
    <>
      {/* Menú Hamburguesa */}
      <MenuButton onClick={handleMenuToggle} aria-label="قائمة">
        <MenuIcon />
      </MenuButton>

      {/* Fixed Vertical Sidebar */}
      <SidebarContainer
        ref={sidebarRef}
      >
        {/* Search Icon */}
        <Tooltip title="البحث في القرآن" placement="bottom">
          <SidebarIcon onClick={handleSearchIconClick}>
            <SearchIcon />
          </SidebarIcon>
        </Tooltip>
        <div style={{ background: 'rgb(166, 190, 247)', width: 4, height: '20%', margin: '2px 0' }} />

        {/* Navigation Icons */}
        {navigationItems.map((item) => (
          <Tooltip key={item.href} title={item.text} placement="bottom">
            <Link href={item.href} passHref>
              <SidebarIcon className={isActive(item.href) ? 'active' : ''}>
                <item.icon />
              </SidebarIcon>
            </Link>
          </Tooltip>
        ))}

        {/* Theme Toggle */}
        <Box sx={{ 
          
          marginTop: 'auto', 
          marginBottom: '5px',
          borderRadius: '12px',
          backgroundColor: 'transparent !important',
          '&:hover': {
            backgroundColor: 'transparent !important',
            border: 'none !important',
            boxShadow: 'none !important',
          } 
          
          }}>
          <Tooltip title="تغيير المظهر" placement="left">
            <SidebarIcon
            sx={{
              color: 'white',
              backgroundColor: 'transparent', 
              '&:hover': {
                backgroundColor: 'transparent',
              },  
            }}
            
            >
              <ColorModeIconDropdown />
            </SidebarIcon>
          </Tooltip>
        </Box>
      </SidebarContainer>

      {/* Expandable Search */}
      {searchExpanded && (
        <ClickAwayListener onClickAway={handleSearchClickAway}>
          <SearchContainer style={{
            width: searchExpanded ? '320px' : '0px',
            opacity: searchExpanded ? 1 : 0,
            boxShadow: searchExpanded ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
          }}>
            <form onSubmit={handleSearchSubmit} style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              <SearchInput
                placeholder="ابحث في القرآن الكريم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputRef={searchInputRef}
                autoFocus={true}
              />
              <SearchButton
               style={{
                 backgroundColor: 'rgba(214, 214, 214, 0.8)',
                 color: '#333',
                  borderRadius: '50%',
                  left: '5px',
               }}
              
              type="submit">
                <SearchIcon />
              </SearchButton>
            </form>
          </SearchContainer>
        </ClickAwayListener>
      )}
    </>
  );

  // استخدام Portal لإخراج القائمة من DOM tree والتأكد من عدم تأثرها بـ transform
  if (!mounted) return null;
  
  return typeof window !== 'undefined' && document.body
    ? createPortal(sidebarContent, document.body)
    : null;
}

export default function AppAppBar() {
  return <AppAppBarContent />;
}
