import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import styles from '../styles/SurahCardCarousel.module.css';
import { useRouter } from 'next/router';
import SurahInstagramCard from './SurahInstagramCard';

const SURAHS_PER_SLIDE = 6; // 2x3 grid

const SurahCard = ({ surah }) => {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/quran/${surah.number}`);
  };
  return <SurahInstagramCard surah={surah} onClick={handleClick} />;
};

// تجميع السور في مجموعات من 6 (شبكة 2×3)
const groupSurahs = (surahs) => {
  const groups = [];
  for (let i = 0; i < surahs.length; i += SURAHS_PER_SLIDE) {
    const group = surahs.slice(i, i + SURAHS_PER_SLIDE);
    groups.push({
      id: `group-${Math.floor(i / SURAHS_PER_SLIDE)}`,
      surahs: group,
      startIndex: i + 1,
      endIndex: Math.min(i + SURAHS_PER_SLIDE, surahs.length)
    });
  }
  return groups;
};

const SurahCardCarousel = ({ surahs = [] }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    direction: 'rtl',
    startIndex: 0
  });
  
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  // تصفية السور بناءً على البحث
  const filteredSurahs = React.useMemo(() => {
    if (!searchTerm.trim()) return surahs;
    
    return surahs.filter(surah =>
      surah.name.ar.includes(searchTerm) ||
      surah.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.number.toString().includes(searchTerm)
    );
  }, [surahs, searchTerm]);

  // تجميع السور المصفاة
  const groupedSurahs = React.useMemo(() => {
    return groupSurahs(filteredSurahs);
  }, [filteredSurahs]);

  // تحديث حالة التنقل
  const updateScrollState = React.useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    
    updateScrollState();
    emblaApi.on('select', updateScrollState);
    emblaApi.on('reInit', updateScrollState);
    
    return () => {
      emblaApi.off('select', updateScrollState);
      emblaApi.off('reInit', updateScrollState);
    };
  }, [emblaApi, updateScrollState]);

  // إعادة تعيين المؤشر عند تغيير البحث
  React.useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0);
      setSelectedIndex(0);
    }
  }, [searchTerm, emblaApi]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi && canScrollPrev) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi, canScrollPrev]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi && canScrollNext) {
      emblaApi.scrollNext();
    }
  }, [emblaApi, canScrollNext]);

  const scrollTo = React.useCallback((index) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  }, [emblaApi]);

  if (!surahs.length) {
    return (
      <div className={styles.container}>
        <div className={styles.noResults}>
          لا توجد سور متاحة
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* شريط البحث */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="ابحث عن سورة باسمها أو رقمها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            aria-label="ابحث عن سورة"
          />
          <div className={styles.searchIcon}>🔍</div>
        </div>
      </div>

      {/* عرض النتائج */}
      {filteredSurahs.length === 0 ? (
        <div className={styles.noResults}>
          لم يتم العثور على نتائج للبحث "{searchTerm}"
        </div>
      ) : (
        <>
          {/* معلومات العرض الحالي */}
          <div className={styles.displayInfo}>
            {groupedSurahs.length > 0 && (
              <span>
                عرض السور {groupedSurahs[selectedIndex]?.startIndex || 1} - {groupedSurahs[selectedIndex]?.endIndex || 9} 
                من أصل {filteredSurahs.length} سورة
              </span>
            )}
          </div>

          {/* الكاروسيل */}
          <div className={styles.carouselWrapper}>
            <div className={styles.embla} ref={emblaRef}>
              <div className={styles.emblaContainer}>
                {groupedSurahs.map((group) => (
                  <div className={styles.emblaSlide} key={group.id}>
                    <div className={styles.gridWrapper}>
                      {group.surahs.map((surah) => (
                        <div key={surah.number} className={styles.gridItem}>
                          <SurahCard surah={surah} />
                        </div>
                      ))}
                      {/* ملء المساحات الفارغة في الشبكة */}
                      {Array.from({ length: SURAHS_PER_SLIDE - group.surahs.length }).map((_, idx) => (
                        <div key={`empty-${idx}`} className={styles.emptyGridItem} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* أزرار التنقل */}
            {groupedSurahs.length > 1 && (
              <div className={styles.navigationContainer}>
                <button
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  aria-label="الصفحة السابقة"
                >
                  <span className={styles.arrow}>‹</span>
                </button>

                {/* مؤشر الصفحات */}
                <div className={styles.pagination}>
                  <span className={styles.pageInfo}>
                    {selectedIndex + 1} من {groupedSurahs.length}
                  </span>
                  <div className={styles.dots}>
                    {groupedSurahs.map((_, index) => (
                      <button
                        key={index}
                        className={`${styles.dot} ${index === selectedIndex ? styles.activeDot : ''}`}
                        onClick={() => scrollTo(index)}
                        aria-label={`الانتقال إلى الصفحة ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  aria-label="الصفحة التالية"
                >
                  <span className={styles.arrow}>›</span>
                </button>
              </div>
            )}
          </div>

          {/* اختصارات لوحة المفاتيح */}
          <div className={styles.keyboardHints}>
            <small>استخدم الأسهم اليمين ← واليسار → للتنقل</small>
          </div>
        </>
      )}
    </div>
  );
};

export default SurahCardCarousel;