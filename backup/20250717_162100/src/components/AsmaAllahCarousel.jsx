import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel  from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Box, Typography, Card, CardContent, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const CarouselContainer = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  borderRadius: '12px',
  position: 'relative',
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
}));

const SlideCard = styled(Card)(({ theme }) => ({
  minWidth: '100%',
  width: '100%',
  margin: '0',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 10px rgba(255, 255, 255, 0.1)' 
    : '0 4px 10px rgba(0, 0, 0, 0.2)',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'var(--card-bg-dark)'
    : 'var(--card-bg-light)',
  border: theme.palette.mode === 'dark' 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 25px rgba(255, 255, 255, 0.15)'
      : '0 8px 25px rgba(0,0,0,0.3)',
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 235, 193, 0.8)',
  },
}));

const ArabicName = styled(Typography)(({ theme }) => ({
  fontFamily: 'Amiri, serif',
  fontSize: '2rem',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: '12px',
  textShadow: theme.palette.mode === 'dark' 
    ? '0 2px 4px rgba(0, 0, 0, 0.5)' 
    : '0 2px 4px rgba(96, 0, 0, 0.15)',
  color: theme.palette.mode === 'dark' 
    ? '#ffffff' 
    : '#1b1b1b',
}));

const Meaning = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  textAlign: 'center',
  lineHeight: 1.5,
  fontWeight: 500,
  color: theme.palette.mode === 'dark' 
    ? '#e0e0e0' 
    : '#1b1b1b',
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : '#24303f',
  color: theme.palette.mode === 'dark' 
    ? '#ffffff' 
    : '#ffffff',
  '&:hover': {
    backgroundColor: '#ffd700',
    color: '#1b1b1b',
  },
  width: '40px',
  height: '40px',
  margin: '0 8px',
}));

const DotsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '12px',
}));

const Dot = styled(Box)(({ theme }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.3)' 
    : '#555',
  margin: '0 4px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  transform: 'scale(1)',
  '&[data-active="true"]': {
    backgroundColor: '#ffd700',
    transform: 'scale(1.2)',
  },
}));

const AsmaAllahCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      slidesToScroll: 1,
      containScroll: false,
      draggable: true,
      direction: 'rtl'
    },
    [Autoplay({ delay: 7000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  
  const [names, setNames] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const scrollTo = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);
  
  // Update selected index when slide changes
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect(); // Call once initially
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    // أسماء الله الحسنى الـ 99
    const asmaAllah = [
      { name: 'اللَّه', meaning: 'اسم الجلالة، الإله المعبود بحق' },
      { name: 'الرَّحْمَن', meaning: 'الذي وسعت رحمته كل شيء' },
      { name: 'الرَّحِيم', meaning: 'الرحيم بعباده المؤمنين' },
      { name: 'الْمَلِك', meaning: 'المالك لكل شيء' },
      { name: 'الْقُدُّوس', meaning: 'المنزه عن كل عيب' },
      { name: 'السَّلاَم', meaning: 'السالم من كل آفة' },
      { name: 'الْمُؤْمِن', meaning: 'المؤمن لعباده' },
      { name: 'الْمُهَيْمِن', meaning: 'المسيطر على كل شيء' },
      { name: 'الْعَزِيز', meaning: 'القوي الغالب' },
      { name: 'الْجَبَّار', meaning: 'القاهر لكل شيء' },
      { name: 'الْمُتَكَبِّر', meaning: 'العظيم الكبير' },
      { name: 'الْخَالِق', meaning: 'خالق كل شيء' },
      { name: 'الْبَارِئ', meaning: 'المبدع للخلق' },
      { name: 'الْمُصَوِّر', meaning: 'مصور كل شيء' },
      { name: 'الْغَفَّار', meaning: 'كثير المغفرة' },
      { name: 'الْقَهَّار', meaning: 'الغالب لكل شيء' },
      { name: 'الْوَهَّاب', meaning: 'كثير العطاء' },
      { name: 'الرَّزَّاق', meaning: 'الرازق لجميع الخلق' },
      { name: 'الْفَتَّاح', meaning: 'الحاكم بين عباده' },
      { name: 'الْعَلِيم', meaning: 'العالم بكل شيء' },
      { name: 'الْقَابِض', meaning: 'القابض للأرزاق والأرواح' },
      { name: 'الْبَاسِط', meaning: 'الموسع في الرزق' },
      { name: 'الْخَافِض', meaning: 'خافض أعدائه' },
      { name: 'الرَّافِع', meaning: 'رافع أوليائه' },
      { name: 'الْمُعِز', meaning: 'معز من أطاعه' },
      { name: 'الْمُذِل', meaning: 'مذل من عصاه' },
      { name: 'السَّمِيع', meaning: 'السامع لكل شيء' },
      { name: 'الْبَصِير', meaning: 'المبصر لكل شيء' },
      { name: 'الْحَكَم', meaning: 'الحاكم العادل' },
      { name: 'الْعَدْل', meaning: 'العادل في أحكامه' },
      { name: 'اللَّطِيف', meaning: 'اللطيف بعباده' },
      { name: 'الْخَبِير', meaning: 'الخبير بعباده' },
      { name: 'الْحَلِيم', meaning: 'الحليم بعباده' },
      { name: 'الْعَظِيم', meaning: 'العظيم في ذاته وصفاته' },
      { name: 'الْغَفُور', meaning: 'الذي يغفر الذنوب جميعاً' },
      { name: 'الشَّكُور', meaning: 'الذي يشكر القليل من العمل ويثيب عليه الكثير' },
      { name: 'الْعَلِيّ', meaning: 'الرفيع القدر' },
      { name: 'الْكَبِير', meaning: 'العظيم الذي كل شيء دونه صغير' },
      { name: 'الْحَفِيظ', meaning: 'الحافظ لكل شيء' },
      { name: 'الْمُقِيت', meaning: 'المقيت لكل شيء' },
      { name: 'الْحسِيب', meaning: 'الكافي للعباد' },
      { name: 'الْجَلِيل', meaning: 'العظيم ذو الجلال' },
      { name: 'الْكَرِيم', meaning: 'الكريم في ذاته وصفاته وأفعاله' },
      { name: 'الرَّقِيب', meaning: 'الرقيب على كل شيء' },
      { name: 'الْمُجِيب', meaning: 'المجيب لدعاء عباده' },
      { name: 'الْوَاسِع', meaning: 'الواسع في عطائه وصفاته' },
      { name: 'الْحَكِيم', meaning: 'الحكيم في أفعاله وأقواله' },
      { name: 'الْوَدُود', meaning: 'الودود لعباده' },
      { name: 'الْمَجِيد', meaning: 'ذو المجد والشرف' },
      { name: 'الْبَاعِث', meaning: 'الذي يبعث الخلق يوم القيامة' },
      { name: 'الشَّهِيد', meaning: 'الشاهد على كل شيء' },
      { name: 'الْحَق', meaning: 'الثابت الذي لا يزول' },
      { name: 'الْوَكِيل', meaning: 'المتكفل بأرزاق العباد' },
      { name: 'الْقَوِيّ', meaning: 'القوي الذي لا يُغلب' },
      { name: 'الْمَتِين', meaning: 'الشديد القوي' },
      { name: 'الْوَلِيّ', meaning: 'الناصر لعباده' },
      { name: 'الْحَمِيد', meaning: 'المحمود في ذاته وصفاته' },
      { name: 'الْمُحْصِي', meaning: 'الذي أحصى كل شيء عدداً' },
      { name: 'الْمُبْدِئ', meaning: 'الذي بدأ الخلق' },
      { name: 'الْمُعِيد', meaning: 'الذي يعيد الخلق بعد الموت' },
      { name: 'الْمُحْيِي', meaning: 'الذي يحيي الخلق' },
      { name: 'المُمِيت', meaning: 'الذي يميت الخلق' },
      { name: 'الْحَيّ', meaning: 'الحي الذي لا يموت' },
      { name: 'الْقَيُّوم', meaning: 'القائم بنفسه المقيم لغيره' },
      { name: 'الْوَاجِد', meaning: 'الواجد لكل شيء' },
      { name: 'الْمَاجِد', meaning: 'ذو المجد والشرف' },
      { name: 'الْواحِد', meaning: 'المنفرد بالألوهية' },
      { name: 'الصَّمَد', meaning: 'الذي يُقصد في الحوائج' },
      { name: 'الْقَادِر', meaning: 'القادر على كل شيء' },
      { name: 'الْمُقْتَدِر', meaning: 'الذي لا يعجزه شيء' },
      { name: 'الْمُقَدِّم', meaning: 'الذي يقدم من يشاء' },
      { name: 'الْمُؤَخِّر', meaning: 'الذي يؤخر من يشاء' },
      { name: 'الأوَّل', meaning: 'الذي ليس قبله شيء' },
      { name: 'الآخِر', meaning: 'الذي ليس بعده شيء' },
      { name: 'الظَّاهِر', meaning: 'الظاهر فوق كل شيء' },
      { name: 'الْبَاطِن', meaning: 'الباطن دون كل شيء' },
      { name: 'الْوَالِي', meaning: 'المتصرف في الأمور' },
      { name: 'الْمُتَعَال', meaning: 'الذي علا وارتفع عن كل شيء' },
      { name: 'الْبَرّ', meaning: 'البار بعباده' },
      { name: 'التَّوَّاب', meaning: 'الذي يقبل التوبة عن عباده' },
      { name: 'الْمُنْتَقِم', meaning: 'المنتقم من أعدائه' },
      { name: 'العَفُوّ', meaning: 'الذي يعفو عن الذنوب' },
      { name: 'الرَّؤُوف', meaning: 'الرؤوف بعباده' },
      { name: 'مَالِكُ الْمُلْك', meaning: 'مالك الملك كله' },
      { name: 'ذُو الْجَلاَلِ وَالإِكْرَام', meaning: 'ذو العظمة والكمال' },
      { name: 'الْمُقْسِط', meaning: 'العادل في حكمه' },
      { name: 'الْجَامِع', meaning: 'الذي يجمع الخلق ليوم الحساب' },
      { name: 'الْغَنِيّ', meaning: 'الغني عن كل شيء' },
      { name: 'الْمُغْنِي', meaning: 'المغني لعباده' },
      { name: 'الْمَانِع', meaning: 'المانع لما يشاء' },
      { name: 'الضَّار', meaning: 'الضار لمن يشاء' },
      { name: 'النَّافِع', meaning: 'النافع لمن يشاء' },
      { name: 'النُّور', meaning: 'منور السماوات والأرض' },
      { name: 'الْهَادِي', meaning: 'الهادي لعباده' },
      { name: 'الْبَدِيع', meaning: 'المبدع في خلقه' },
      { name: 'الْبَاقِي', meaning: 'الباقي الذي لا يفنى' },
      { name: 'الْوَارِث', meaning: 'الوارث لكل شيء بعد فناء الخلق' },
      { name: 'الرَّشِيد', meaning: 'المرشد إلى الصواب' },
      { name: 'الصَّبُور', meaning: 'الصبور على عباده' }
    ];
    
    setNames(asmaAllah);
  }, []);

  if (names.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography sx={{ color: 'rgba(241, 228, 228, 0.7)' }}>
          جاري التحميل...
        </Typography>
      </Box>
    );
  }

  return (
    <CarouselContainer>
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          <NavigationButton onClick={scrollPrev} aria-label="السابق">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </NavigationButton>
        </Box>
        
        <div className="embla__viewport" ref={emblaRef}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              py: 2,
              px: 1,
            }}
            className="embla__container"
          >
            {names.map((item, index) => (
              <Box
                key={index}
                sx={{
                  flex: '0 0 100%',
                  minWidth: '100%',
                  maxWidth: '100%',
                  padding: '0.5rem',
                  position: 'relative'
                }}
                className="embla__slide"
              >
                <SlideCard elevation={0}>
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <ArabicName variant="h5">
                      {item.name}
                    </ArabicName>
                    <Meaning variant="body1">
                      {item.meaning}
                    </Meaning>
                  </CardContent>
                </SlideCard>
              </Box>
            ))}
          </Box>
        </div>
        
        <Box sx={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          <NavigationButton onClick={scrollNext} aria-label="التالي">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </NavigationButton>
        </Box>
      </Box>
      
      <DotsContainer>
        {names.map((_, index) => (
          <Dot
            key={index}
            data-active={index === selectedIndex}
            onClick={() => scrollTo(index)}
            aria-label={`انتقل إلى الاسم ${index + 1}`}
          />
        ))}
      </DotsContainer>
    </CarouselContainer>
  );
};

export default AsmaAllahCarousel;