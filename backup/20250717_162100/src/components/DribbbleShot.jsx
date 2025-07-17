
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { alpha, styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import ColorModeIconDropdown from '../theme/ColorModeIconDropdown';
import Head from 'next/head';
import Image from 'next/image';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Container from '@mui/material/Container';

// Prefetch links and preload logo for faster loading
function AppPreload() {
  return (
       <>
      <Preload />
      <Head>
      {/* Preload logo image */}
      <link rel="preload" href="/logoq.png" as="image" />
    </Head>
    </>
  );
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: { marginLeft: theme.spacing(1), width: 'auto' },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingRight: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: { width: '20ch', '&:focus': { width: '30ch' } },
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  backdropFilter: 'blur(24px)',
  backgroundColor: theme.palette.background.default + 'cc',
  padding: theme.spacing(1, 2),
}));

const LogoContainer = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  '&:hover img': { opacity: 0.8 },
}));

function AppAppBarContent() {
 
  // Preload logo image
  const Preload = () => (
    <Head>

      <link rel="preload" href="/logoq.png" as="image" />
    </Head>
  );
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const theme = useTheme();

  const toggleDrawer = (value) => setOpen(value);
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search/${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      <AppPreload />
      <AppBar position="sticky" elevation={2} sx={{ background: 'transparent' }}>
        <Container maxWidth="lg">
          <StyledToolbar disableGutters>
            <LogoContainer href="/" prefetch={true}>
              <Image src="/logoq.png" alt="Quran Logo" width={100} height={50} priority />
            </LogoContainer>

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              {['/quran-sound','/quran-pdf','/quran-radio','/quran-tafseer'].map((path, idx) => (
                <Link key={idx} href={path} prefetch={true} passHref>
                  <Button component="a" sx={{ color: theme.palette.text.primary }}>
                    {['المصحف','PDF','الراديو','التفسير'][idx]}
                  </Button>
                </Link>
              ))}
              <ColorModeIconDropdown />
              <Box component="form" onSubmit={handleSearch} sx={{ ml:2 }}>
                <Search>
                  <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
                  <StyledInputBase placeholder="ابحث عن آية..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </Search>
              </Box>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton onClick={() => toggleDrawer(true)} sx={{ display: { md: 'none' }, color: theme.palette.text.primary }}>
              <MenuIcon />
            </IconButton>
          </StyledToolbar>
        </Container>

        {/* Mobile Drawer */}
        <Drawer anchor="top" open={open} onClose={() => toggleDrawer(false)}>
          <Box sx={{ p:2 }}>
            <Box sx={{ display:'flex', justifyContent:'flex-end' }}>
              <IconButton onClick={() => toggleDrawer(false)}><CloseRoundedIcon /></IconButton>
            </Box>
            {['/','/quran-sound','/quran-pdf','/about'].map((path, idx) => (
              <MenuItem key={idx} onClick={() => { toggleDrawer(false); router.push(path); }}>
                {['الرئيسية','MP3','PDF','من نحن'][idx]}
              </MenuItem>
            ))}
          </Box>
        </Drawer>
      </AppBar>
    </>
  );
}

export default function AppAppBar() {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppAppBarContent />
    </ThemeProvider>
  );
}


