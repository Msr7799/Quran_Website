import SeoHead from '../../components/SeoHead';
import QuranSoundContainer from '../../components/QuranSoundContainer';

export default function QuranSoundPage() {
    return (
        <>
            <SeoHead
                title="استماع القرآن الكريم - اختر قارئاً وسورة للاستماع"
                description="استمع للقرآن الكريم بصوت أفضل القراء من مختلف أنحاء العالم. اختر قارئك المفضل والسورة واستمتع بتلاوة القرآن الكريم بجودة عالية."
                url={`${process.env.NEXT_PUBLIC_BASE_URL}/quran-sound`}
                image={`${process.env.NEXT_PUBLIC_BASE_URL}/images/reciters-image.jpg`}
                keywords="القراء, القرآن الكريم, تلاوة القرآن, مشاهير القراء, قراء القرآن, تحميل القرآن mp3, استماع القرآن, تلاوات قرآنية, السور"
            />
            <QuranSoundContainer />
        </>
    );
}
