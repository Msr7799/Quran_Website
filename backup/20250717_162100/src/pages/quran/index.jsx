import { useEffect } from 'react';
import { useRouter } from 'next/router';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function QuranIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the first page of the Quran in the new path
    router.replace('/quran-pages/1');
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
