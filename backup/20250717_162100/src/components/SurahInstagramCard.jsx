import React from 'react';
import styles from '../styles/SurahCardCarousel.module.css';
import convertToArabicNumerals from '../utils/convertToArabicNumerals';

const SurahInstagramCard = ({ surah, onClick }) => {
  return (
    <div className={styles.instagramCard} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.surahNumber}>{convertToArabicNumerals(surah.number)}</div>
        <div className={styles.surahNameAr}>{surah.name.ar}</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.englishName}>{surah.name.en}</div>
        <div className={styles.verseCount}>
          {convertToArabicNumerals(surah.ayahCount || surah.verses_count)} آية
        </div>
      </div>
      <div className={styles.cardFooter}>
        <span className={styles.revelationType}>
          {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
        </span>
      </div>
    </div>
  );
};

export default SurahInstagramCard;
