import * as React from 'react';
import DarkModeIcon from '@mui/icons-material/DarkModeRounded';
import LightModeIcon from '@mui/icons-material/LightModeRounded';
import IconButton, { IconButtonOwnProps } from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';

export default function ColorModeIconDropdown(props: IconButtonOwnProps) {
  const { mode, systemMode, setMode } = useColorScheme();

  const handleToggle = () => {
    const currentMode = systemMode || mode;
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  };

  if (!mode) {
    return null;
  }

  const resolvedMode = (systemMode || mode) as 'light' | 'dark';
  const icon = {
    light: <LightModeIcon />,
    dark: <DarkModeIcon />,
  }[resolvedMode];

  return (
    <IconButton
      data-screenshot="toggle-mode"
      onClick={handleToggle}
      disableRipple
      size="medium"
      title={`تبديل إلى ${resolvedMode === 'light' ? 'الوضع المظلم' : 'الوضع الفاتح'}`}
      sx={{
        
        backdropFilter: ' blur(100px)',
        backgroundColor: 'rgba(255, 255, 255, 0.5) !important',
        boxShadow: 'none !important',
        borderRadius: '20% !important',
        width: '45px !important',
        
        position: 'relative',
        zIndex: 10002,
      }}
    {...props}
    >
      {icon}
    </IconButton>
  );
}
