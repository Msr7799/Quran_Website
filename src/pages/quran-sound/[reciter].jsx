import { useRouter } from 'next/router';
import { useState, useMemo } from 'react';
import SeoHead from '../../components/SeoHead';
import SurahsList from '../../components/SurahsList';
import QuranPlayer from '../../components/QuranPlayer';
import styles from '../../styles/QuranSound.module.css';
import quranData from '../../../public/json/metadata.json';
import recitersData from '../../../public/json/quranMp3.json';

export default function ReciterPage() {
    const router = useRouter();
    const { reciter } = router.query; // الحصول على slug من مسار URL

    const [selectedReciter, setSelectedReciter] = useState(null);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [currentSurahIndex, setCurrentSurahIndex] = useState(null);

    // دالة لتحويل الاسم إلى slug
    const createSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/\s+/g, '-') // استبدال المسافات بـ -
            .replace(/[^\w\-]+/g, ''); // إزالة أي رموز غير أحرف أو أرقام أو شرطات
    };

    // دالة للعثور على القارئ بناءً على الـ slug
    const selectedReciterData = useMemo(() => {
        return recitersData.find(r => createSlug(r.reciter.en) === reciter);
    }, [reciter]);

    if (!selectedReciterData) {
        return (
            <main className={styles.container}>
                <p className={styles.errorMessage}>
                    لم نتمكن من العثور على القارئ الذي تبحث عنه. يرجى التحقق من الرابط والتأكد من صحة الاسم.
                </p>
                <button onClick={() => router.push('/quran-sound')} className={styles.backButton}>
                    رجوع إلى قائمة المقرئين
                </button>
            </main>
        );
    }

    const handlePlay = (src, index) => {
        setCurrentSurahIndex(index);
        setCurrentAudio(src);
    };

    const handleBack = () => {
        router.push('/quran-sound');
    };

    const handleClosePlayer = () => {
        setCurrentAudio(null);
    };

    const handleNext = () => {
        if (currentSurahIndex < quranData.length - 1) {
            const nextIndex = currentSurahIndex + 1;
            const nextSrc = `${selectedReciterData.server}/${quranData[nextIndex].number.toString().padStart(3, '0')}.mp3`;
            setCurrentSurahIndex(nextIndex);
            setCurrentAudio(nextSrc);
        }
    };

    const handlePrev = () => {
        if (currentSurahIndex > 0) {
            const prevIndex = currentSurahIndex - 1;
            const prevSrc = `${selectedReciterData.server}/${quranData[prevIndex].number.toString().padStart(3, '0')}.mp3`;
            setCurrentSurahIndex(prevIndex);
            setCurrentAudio(prevSrc);
        }
    };

    const getPrevSurah = () => {
        if (currentSurahIndex > 0) {
            return quranData[currentSurahIndex - 1]?.name.ar || null;
        }
        return null;
    };

    const getNextSurah = () => {
        if (currentSurahIndex < quranData.length - 1) {
            return quranData[currentSurahIndex + 1]?.name.ar || null;
        }
        return null;
    };

    return (
        <>

            <SeoHead
                title={`${selectedReciterData?.reciter.ar} - استمع لتلاوة القرآن الكريم بصوت ${selectedReciterData?.reciter.ar}`}
                description={`استمع للقرآن الكريم كاملاً بصوت ${selectedReciterData?.reciter.ar} (${selectedReciterData?.reciter.en}) برواية ${selectedReciterData?.rewaya.ar}. استمتع بتلاوة عالية الجودة مع إمكانية التنقل بين السور.`}
                url={`${process.env.NEXT_PUBLIC_BASE_URL}/quran-sound/${reciter}`}
                image={`${process.env.NEXT_PUBLIC_BASE_URL}/images/quran-reciter-image.jpg`}
                keywords={`القرآن الكريم, تلاوة القرآن, ${selectedReciterData?.reciter.ar}, ${selectedReciterData?.reciter.en}, مشاهير القراء, رواية ${selectedReciterData?.rewaya.ar}, تحميل القرآن mp3, استماع القرآن, تلاوات قرآنية`}
            />

            <main className={styles.container}>
                {selectedReciterData && (
                    <div>
                        <button onClick={handleBack} className={styles.backButton} title='رجوع إلى قائمة المقرئين' aria-label='رجوع إلى قائمة المقرئين'>
                            رجوع إلى قائمة المقرئين
                        </button>
                        
                        {/* قسم معلومات القارئ مع الصورة */}
                        <div className={styles.reciterInfoSection}>
                            <div className={styles.reciterImageContainer}>
                                <img 
                                    src="/logo.png" 
                                    alt={selectedReciterData.reciter.ar}
                                    className={styles.reciterImage}
                                />
                            </div>
                            <h1 className={styles.reciterName}>
                                {selectedReciterData.reciter.ar}
                            </h1>
                            <p className={styles.reciterNameEn}>
                                {selectedReciterData.reciter.en}
                            </p>
                        </div>

                        <SurahsList
                            reciter={selectedReciterData}
                            onPlay={handlePlay}
                            prevSurah={getPrevSurah()}
                            nextSurah={getNextSurah()}
                            quranData={quranData}
                        />
                    </div>
                )}
                
                {currentAudio && (
                    <div className={styles.playerSection}>
                        {/* قسم صورة القارئ وتفاصيل السورة فوق المشغل */}
                        <div className={styles.playingInfoSection}>
                            <div className={styles.reciterImageContainer}>
                                <img 
                                    src="/logo.png" 
                                    alt={selectedReciterData.reciter.ar}
                                    className={styles.reciterImage}
                                />
                            </div>
                            <h2 className={styles.playingReciterName}>
                                {selectedReciterData.reciter.ar}
                            </h2>
                            <p className={styles.playingSurahName}>
                                {quranData[currentSurahIndex]?.name?.ar || 'القرآن الكريم'}
                            </p>
                            <p className={styles.recitation}>
                                رواية: {selectedReciterData.rewaya.ar}
                            </p>
                        </div>
                        
                        <QuranPlayer
                            reciter={selectedReciterData}
                            surah={quranData[currentSurahIndex]}
                            currentAudio={currentAudio}
                            onPlay={handlePlay}
                            onBack={handleBack}
                            onClose={handleClosePlayer}
                            onNext={handleNext}
                            onPrev={handlePrev}
                            prevSurah={getPrevSurah()}      
                            src={currentAudio}
                            nextSurah={getNextSurah()}
                        />
                    </div>
                )}
            </main>
        </>
    );
}
