import { useEffect } from 'react';
import { useColorScheme } from '@mui/material/styles';
import { useTheme } from './ThemeContext';

export function ThemeSync() {
  const { mode, setMode } = useColorScheme();
  const { darkMode, setDarkMode } = useTheme();
  
  // مزامنة الوضع عند تحميل الصفحة
  useEffect(() => {
    const savedMode = localStorage.getItem('mui-mode');
    if (savedMode === 'dark' || savedMode === 'light') {
      setMode(savedMode as 'light' | 'dark');
    }
  }, [setMode]);
  
  // مزامنة وضع MUI مع ThemeContext
  useEffect(() => {
    if (mode === 'dark' && !darkMode) {
      setDarkMode(true);
    } else if (mode === 'light' && darkMode) {
      setDarkMode(false);
    }
  }, [mode, darkMode, setDarkMode]);

  useEffect(() => {
    // تطبيق الثيم على العناصر
    const root = document.documentElement;
    const body = document.body;
    
    if (mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.setAttribute('data-mui-color-scheme', 'dark');
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      root.setAttribute('data-theme', 'light');
      root.setAttribute('data-mui-color-scheme', 'light');
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
    
    // حفظ الوضع في localStorage
    if (mode) {
      localStorage.setItem('mui-mode', mode);
    }
  }, [mode]);

  // هذا المكون لا يعرض شيئاً، فقط يتعامل مع الثيم
  return null;
}
