import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import SeoHead from '../components/SeoHead';
import styles from '../styles/Quran.module.css';
import convertToArabicNumerals from '../utils/convertToArabicNumerals';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
// Dynamic imports with loading states
const SurahCardCarousel = dynamic(
  () => import('../components/SurahCard'),
  { loading: () => <div>تحميل البطاقات…</div> }
);


const AsmaAllahCarousel = dynamic(
  () => import('../components/AsmaAllahCarousel'),
  { loading: () => <div>جاري تحميل أسماء الله الحسنى…</div> }
);

const HadithCarousel = dynamic(
  () => import('../components/HadithCarousel'),
  { loading: () => <div>جاري تحميل الأحاديث…</div> }
);

export async function getStaticProps() {
  const fs = require('fs');
  const path = require('path');

  try {
    const filePath = path.join(process.cwd(), 'public', 'json', 'metadata.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const initialSurahs = JSON.parse(fileContents);
    return { props: { initialSurahs, error: null } };
  } catch (err) {
    return { props: { initialSurahs: [], error: err.message } };
  }
}

export default function Home({ initialSurahs = [], error }) {
  const [visibleCount, setVisibleCount] = useState(12);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, initialSurahs.length));
  };

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.error}>حدث خطأ: {error}</div>
      </main>
    );
  }

  return (
    <>
      <SeoHead
        title="فهرس سور القرآن الكريم"
        description="تصفح السور مع تفاصيلها."
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/quran`}
        image={`${process.env.NEXT_PUBLIC_BASE_URL}/quran-image.jpg`}
      />


      {/* Hero Section - كامل العرض */}
      <Box
        sx={{
          position: 'relative',
          width: 'calc(100vw / 0.67)',
          marginLeft: 'calc(-50vw / 0.67 + 50%)',
          marginRight: 'calc(-50vw / 0.67 + 50%)',
          transform: 'scale(1)',
          transformOrigin: 'center top',
          marginBottom: '50px', // مسافة لضمان عدم تداخل المحتوى
          backgroundColor: 'transparent', // إزالة الخلفية السوداء
          overflow: 'hidden', // منع تجاوز المحتوى
        }}
      >
        {/* Hero Background */}

        {/* Decorative Section - كامل العرض */}
        <Box
          sx={{
            backgroundImage: 'url(/alf.gif)',
            height: '180vh',
            backgroundSize:'cover',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'bottom center',
            backgroundPosition: 'center 80%',
            filter: 'contrast(1) brightness(0.9) drop-shadow(0 0 2px rgba(207, 193, 193, 0.356))'
          }}
        />

          <img
            src="./aqra1.svg"
            alt="iqra"
            style={{
              maxWidth: '75vw',
              position: 'absolute',
              zIndex: 10,
              top: '500px',
              right: '450px',
              width: '180%',  
              maxHeight: '150vh',
              objectFit: 'contain',
              margin: '0 auto',
              display: 'block',
              height: 'auto',
              filter: 'contrast(1.4) brightness(0.9) saturate(2) drop-shadow(10px 10px 50px rgba(0, 0, 0, 0.58))'
            }}
          />
     
      </Box>

      {/* المحتوى العادي مع Container - يبدأ بعد Hero Section */}
      <Box sx={{ 
        position: 'relative', 
        zIndex: 1,
        backgroundColor: 'background.default',
        minHeight: '100px' // ضمان وجود مساحة
      }}>
        {/* Asma Allah Carousel Section */}
          <Container maxWidth="lg" sx={{ mt: 6, mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              mt: 8,
              pt: 9,
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            أسماء الله الحسنى
          </Typography>
          
          <AsmaAllahCarousel
          

          /> 
          
        </Container>
      
        {/* Hadith Carousel Section */}
        <Container maxWidth="lg" sx={{ 
          pt: 6, 
          mb: 4,
          backgroundColor: 'transparent',
        


         }}>
          <Typography
            variant="h4"
            sx={{
              mb: 6,
              textAlign: 'center',
              fontWeight: 'bold',
              
            }}
            >
            الأحاديث الشريفة
          </Typography>
          
          <HadithCarousel 
          sx={{
              with: '100%',
              height: '100%',

              }}
          />
        </Container>


        {/* Surah Cards Section */}
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center', direction: 'rtl' }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            فهرس سور القرآن الكريم
          </Typography>
          <SurahCardCarousel surahs={initialSurahs} />
        </Container>

      </Box>

     
    </>
  );
}