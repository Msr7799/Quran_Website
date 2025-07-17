import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import RadioIcon from '@mui/icons-material/Radio';
import InfoIcon from '@mui/icons-material/Info';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import ColorModeIconDropdown from '../theme/ColorModeIconDropdown';

const SIDEBAR_WIDTH = 55;

// Styled Components
const SidebarContainer = styled(Box)(({ theme }) => ({
  position: 'fixed !important',
  top: '0 !important',
  right: '0 !important',
  width: `${SIDEBAR_WIDTH}px`,
  height: '100vh !important',
  background: theme.palette.mode === 'light' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
  zIndex: '1500 !important',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '10px 0',
  boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(10px)',
  transform: 'none !important',
  zoom: '1 !important',
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const SidebarIcon = styled(IconButton)(({ theme, active }) => ({
  width: 45,
  height: 45,
  margin: '5px 0',
  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
  backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    transform: 'scale(1.1)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '24px',
  },
}));

const SearchContainer = styled(Box)(({ theme, expanded }) => ({
  position: 'fixed !important',
  top: '60px !important',
  right: expanded ? '65px' : '55px',
  width: expanded ? '280px' : '0px',
  height: '45px',
  backgroundColor: 'rgba(255,255,255,0.95)',
  borderRadius: '25px',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: expanded ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
  zIndex: '1600 !important',
  transform: 'none !important',
  zoom: '1 !important',
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  padding: '0 20px',
  color: '#333',
  '& .MuiInputBase-input': {
    '&::placeholder': {
      color: '#666',
      opacity: 1,
    },
  },
}));

const ThemeToggleContainer = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  marginBottom: '10px',
  paddingBottom: '10px',
}));

const MainContent = styled(Box)(({ theme }) => ({
  marginRight: `${SIDEBAR_WIDTH}px`,
  minHeight: '100vh',
  transition: 'margin-right 0.3s ease',
  width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
  overflowX: 'hidden',
}));

const navigationItems = [
  { text: 'الصفحة الرئيسية', icon: HomeIcon, href: '/' },
  { text: 'المصحف الشريف', icon: BookIcon, href: '/quran' },
  { text: 'الصوتيات', icon: VolumeUpIcon, href: '/quran-sound' },
  { text: 'المصحف PDF', icon: PictureAsPdfIcon, href: '/quran-pdf' },
  { text: 'الراديو', icon: RadioIcon, href: '/quran-radio' },
  { text: 'التفسير', icon: BookIcon, href: '/quran-tafseer' },
  { text: 'من نحن', icon: InfoIcon, href: '/about' },
];

function AppAppBarContent({ children }) {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const theme = useTheme();

  const handleSearchToggle = () => {
    setSearchExpanded(!searchExpanded);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
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
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Fixed Vertical Sidebar */}
      <SidebarContainer>
        {/* Search Icon */}
        <Tooltip title="البحث في القرآن" placement="left">
          <SidebarIcon onClick={handleSearchToggle}>
            <SearchIcon />
          </SidebarIcon>
        </Tooltip>

        {/* Navigation Icons */}
        {navigationItems.map((item) => (
          <Tooltip key={item.href} title={item.text} placement="left">
            <Link href={item.href} passHref>
              <SidebarIcon active={isActive(item.href)}>
                <item.icon />
              </SidebarIcon>
            </Link>
          </Tooltip>
        ))}

        {/* Theme Toggle */}
        <ThemeToggleContainer>
          <Tooltip title="تغيير المظهر" placement="left">
            <SidebarIcon>
              <ColorModeIconDropdown />
            </SidebarIcon>
          </Tooltip>
        </ThemeToggleContainer>
      </SidebarContainer>

      {/* Expandable Search */}
      <ClickAwayListener onClickAway={handleSearchClickAway}>
        <SearchContainer expanded={searchExpanded}>
          <form onSubmit={handleSearchSubmit} style={{ width: '100%', display: 'flex' }}>
            <SearchInput
              placeholder="ابحث في القرآن الكريم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={searchExpanded}
            />
            {searchExpanded && (
              <IconButton 
                type="submit" 
                sx={{ p: '10px', color: '#666' }}
              >
                <SearchIcon />
              </IconButton>
            )}
          </form>
        </SearchContainer>
      </ClickAwayListener>

      {/* Main Content Area */}
      <MainContent>
        {children}
      </MainContent>
    </>
  );
}

export default function AppAppBar({ children }) {
  return <AppAppBarContent>{children}</AppAppBarContent>;
}