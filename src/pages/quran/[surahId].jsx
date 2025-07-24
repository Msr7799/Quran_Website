import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { FaCopy, FaShareAlt } from 'react-icons/fa';
import { MdMenuBook } from 'react-icons/md';
import SeoHead from '../../components/SeoHead';
import styles from '../../styles/Surah.module.css';
import convertToArabicNumerals from '../../utils/convertToArabicNumerals';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TafseerPopup from '../../components/AudioPlayer/tafseer_popup.js';

export default function SurahPage({ surah, prevSurah, nextSurah }) {
    if (!surah) {
        return (
            <main className={styles.main}>
                <div className={styles.error}>حدث خطأ: لم يتم العثور على السورة.</div>
            </main>
        );
    }
    
    
    const router = useRouter();
    
    let prefaceText = "";
    if (surah.number !== 1) {
        if (surah.number === 9) {
            prefaceText = "أعوذ بالله من الشيطان الرجيم";
        } else {
            prefaceText = "بسم الله الرحمن الرحيم";
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('تم نسخ الآية!');
    };

    const shareVerse = (text) => {
        if (navigator.share) {
            navigator.share({
                title: 'مشاركة آية',
                text: text,
            }).then(() => console.log('تمت المشاركة بنجاح'))
                .catch((error) => console.log('حدث خطأ في المشاركة', error));
        } else {
            alert('ميزة المشاركة غير مدعومة على هذا المتصفح');
        }
    };

    const openTafseer = (verse, verseIndex) => {
        setSelectedVerse({
            surahNumber: surah.number,
            ayahNumber: verseIndex + 1,
            ayahText: verse.text.ar,
            surahName: surah.name.ar
        });
        setTafseerOpen(true);
    };

    // 1. حالة لعدد الآيات المعروضة
    const [visibleCount, setVisibleCount] = React.useState(10);

    // حالة التفسير
    const [tafseerOpen, setTafseerOpen] = useState(false);
    const [selectedVerse, setSelectedVerse] = useState(null);

    return (
        <>

            <SeoHead
                title={`سورة ${surah.name.ar} (${surah.name.en}) - قراءة مفصلة من القرآن الكريم`}
                description={`اكتشف سورة ${surah.name.ar} من القرآن الكريم، والتي تحتوي على ${surah.verses_count} آية ونزلت في ${surah.revelation_place.ar}. تصفح تفاصيل السورة، مع إمكانية الاستماع للتلاوة وقراءة النصوص. احصل على معلومات شاملة حول السورة ومعانيها.`}
                url={`${process.env.NEXT_PUBLIC_BASE_URL}/quran/${surah.number}.html`}
                image={`${process.env.NEXT_PUBLIC_BASE_URL}/images/surah-${surah.number}.jpg` }
                keywords={`سورة ${surah.name.ar}, سورة ${surah.name.en}, القرآن الكريم, تفاصيل السورة, عدد الآيات, مكان نزول السورة, تلاوة القرآن, قراءة القرآن الكريم, تفسير السور, معلومات قرآنية`}
            />

            <main className={styles.main}>

                <h1 className={styles.title}>سورة {surah.name.ar}</h1>

                <div className={styles.boxInfo}>
                    <p className={styles.titleInfo}>معلومات عن السورة</p>
                    <div className={styles.box_details}>
                        <p className={styles.details}>اسم السورة بالعربي: <span>{surah.name.ar}</span></p>
                        <p className={styles.details}>اسم السورة بالإنجليزي: <span>{surah.name.en}</span></p>
                        <p className={styles.details}>مكان النزول: <span>{surah.revelation_place.ar}</span></p>
                        <p className={styles.details}>عدد الآيات: <span>{convertToArabicNumerals(surah.verses_count)}</span></p>
                        <p className={styles.details}>عدد الكلمات: <span>{convertToArabicNumerals(surah.words_count)}</span></p>
                        <p className={styles.details}>عدد الحروف: <span>{convertToArabicNumerals(surah.letters_count)}</span></p>
                    </div>
                </div>

                <div className={styles.navigation}>
                    {prevSurah && (
                        <Link href={`/quran/${prevSurah.number}`} className={styles.navButton} title={`سورة ${prevSurah.name.ar}`} aria-label={`سورة ${prevSurah.name.ar}`}>
                            سورة {prevSurah.name.ar}
                        </Link>
                    )}
                    {nextSurah && (
                        <Link href={`/quran/${nextSurah.number}`} className={styles.navButton}>
                            سورة {nextSurah.name.ar}
                        </Link>
                    )}
                </div>
                <Box>
                    <Button
                    onClick={() => router.push('/quran-pages')}
                    variant="contained"
                    color="warning"
                    sx={{
                        position: 'fixed',
                        bottom: '10px',
                        right: '20px',
                        zIndex: 9999,
                        width: '15px', 
                        height: '40px',
                        fontSize: '16px !important',
                        fontWeight: '900',
                        borderRadius: '5px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: '#0A094EFF',
                            transform: 'translateY(-2px)',
                        }, }} >
                    ↪       
                </Button>
                    
                    </Box>

                <div className={styles.surahText}>
                    {prefaceText && (
                        <p className={styles.bismillah}>{prefaceText}</p>
                    )}
                    {/* 2. عرض فقط visibleCount آية */}
                    {surah.verses.slice(0, visibleCount).map((verse, index) => {
                        const formattedText = `
"${verse.text.ar}"

🌐 ترجمة:

"${verse.text.en}"

🔖 — ${surah.name.ar}:${index + 1}`;

                        return (
                            <div key={index} className={styles.verseContainer}>
                                <div
                                    className={styles.verseBox}
                                    onClick={() => openTafseer(verse, index)}
                                    style={{ cursor: 'pointer' }}
                                    title="اضغط لعرض التفسير"
                                >
                                    <p className={styles.verseText} title={verse.text.ar} aria-label={verse.text.ar.split(" ").join("_")}>{verse.text.ar}</p>
                                    <p className={styles.verseTextEn} title={verse.text.en} aria-label={verse.text.en.split(" ").join("_")}>{verse.text.en}</p>
                                </div>
                                <span className={styles.VerseNumber} title={index + 1} aria-label={index + 1}>
                                    {convertToArabicNumerals(index + 1)}
                                </span>
                                <div className={styles.actions}>
                                    <MdMenuBook
                                        className={styles.icon}
                                        onClick={() => openTafseer(verse, index)}
                                        title="عرض التفسير"
                                    />
                                    <FaCopy
                                        className={styles.icon}
                                        onClick={() => copyToClipboard(formattedText)}
                                        title="نسخ الآية"
                                    />
                                    <FaShareAlt
                                        className={styles.icon}
                                        onClick={() => shareVerse(formattedText)}
                                        title="مشاركة الآية"
                                    />
                                </div>
                            </div>
                        )
                    })}
                    {/* 3. زر "حمّل المزيد" */}
                    {visibleCount < surah.verses.length && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<ExpandMoreIcon />}
                                onClick={() => setVisibleCount(c => Math.min(c + 10, surah.verses.length))}
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    borderRadius: '25px',
                                    padding: '10px 32px'
                                }}
                            >
                                حمّل المزيد
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            {/* مكون التفسير */}
            {selectedVerse && (
                <TafseerPopup
                    open={tafseerOpen}
                    onClose={() => setTafseerOpen(false)}
                    surahNumber={selectedVerse.surahNumber}
                    ayahNumber={selectedVerse.ayahNumber}
                    ayahText={selectedVerse.ayahText}
                    surahName={selectedVerse.surahName}
                />
            )}
        </>
    );
}

export async function getStaticPaths() {
    const filePath = path.join(process.cwd(), 'public', 'json', 'metadata.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const paths = data.map(surah => ({
        params: { surahId: `${surah.number}` },
    }));

    return {
        paths,
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const surahId = parseInt(params.surahId);

    const surahFilePath = path.join(process.cwd(), 'public', 'json', 'surah', `surah_${surahId}.json`);
    const metadataFilePath = path.join(process.cwd(), 'public', 'json', 'metadata.json');

    try {
        const surahData = JSON.parse(fs.readFileSync(surahFilePath, 'utf8'));
        const allSurahs = JSON.parse(fs.readFileSync(metadataFilePath, 'utf8'));

        const currentSurahIndex = allSurahs.findIndex(surah => surah.number === surahId);

        const prevSurah = allSurahs[currentSurahIndex - 1] || null;
        const nextSurah = allSurahs[currentSurahIndex + 1] || null;

        return {
            props: {
                surah: surahData || null,
                prevSurah,
                nextSurah,
            },
        };
    } catch (error) {
        console.error("خطأ في قراءة البيانات:", error);
        return {
            props: {
                surah: null,
                prevSurah: null,
                nextSurah: null,
            },
        };
    }
}