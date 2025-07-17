import React, { useEffect, useState, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import styles from '../styles/EmblaCarousel.module.css';
import Autoplay from 'embla-carousel-autoplay';

export default function HadithCarousel() {
  // Configurar para presentación horizontal
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    draggable: true,
    slidesToScroll: 1,
    direction: 'rtl',
    containScroll: false
  },
  [Autoplay({ delay: 15000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [hadiths, setHadiths] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollTimeout = useRef();

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
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
    fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        // Log the data to inspect its structure
        console.log('API Response:', data);
        
        // Extract hadiths from the response
        let hadithsData = [];
        if (data.hadiths && Array.isArray(data.hadiths)) {
          // Try to find arabic text in various possible properties
          hadithsData = data.hadiths
            .filter(h => {
              // Check various possible property names for arabic text
              const arabicText = h.text || h.arabic || h.hadithArabic || h.text_ar;
              return arabicText && arabicText.trim().length > 0;
            })
            .map(h => ({
              ...h,
              // Use the first non-empty text property we find
              hadithArabic: h.text || h.arabic || h.hadithArabic || h.text_ar,
              hadithNumber: h.number || h.hadithNumber || h.id
            }))
            .slice(0, 8); // Limitamos a 8 hadices para mejor rendimiento
        }
        
        console.log('Processed Hadiths:', hadithsData);
        
        if (hadithsData.length === 0) {
          // If no hadiths found, add a fallback
          hadithsData = [{
            hadithNumber: 1,
            hadithArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
          }];
        }
        
        setHadiths(hadithsData);
      })
      .catch(err => {
        console.error('Error fetching hadiths:', err);
        // Set some fallback data if the fetch fails
        setHadiths([{
          hadithNumber: 1,
          hadithArabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
        }]);
      });
  }, []);

  // Ya no necesitamos el auto-scroll personalizado porque estamos usando el plugin Autoplay

  if (hadiths.length === 0) {
    return <div className={styles.loading}>جاري تحميل الأحاديث...</div>;
  }

  return (
    <div className={styles.emblaWrapper}>
      <div className={styles.embla}>
        <div className={styles.embla__viewport} ref={emblaRef}>
          <div className={styles.embla__container}>
            {hadiths.map((h, i) => (
              <div key={i} className={styles.embla__slide}>
                <div className={styles.hadithContent}>
                  <p className={styles.hadithNumber}>حَدِيث {h.hadithNumber || i + 1}</p>
                  <div className={styles.hadithTextWrapper}>
                    <p className={styles.arabicText}>{h.hadithArabic}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.embla__navigation}>
          <button
            className={styles.embla__button}
            onClick={scrollPrev}
            aria-label="السابق"
          >
            <svg className={styles.embla__button__svg} viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          
          <div className={styles.embla__dots}>
            {hadiths.map((_, index) => (
              <button
                key={index}
                className={`${styles.embla__dot} ${index === selectedIndex ? styles.embla__dot__selected : ''}`}
                type="button"
                onClick={() => emblaApi && emblaApi.scrollTo(index)}
                aria-label={`انتقل إلى الحديث ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            className={styles.embla__button}
            onClick={scrollNext}
            aria-label="التالي"
          >
            <svg className={styles.embla__button__svg} viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
