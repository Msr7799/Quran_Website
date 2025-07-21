# AudioPlayer Components

مجموعة مكونات مشغل الصوت للقرآن الكريم مع ميزات متقدمة.

## المكونات

### QuranAudioPlayer.jsx
مشغل القرآن الصوتي الرئيسي مع الميزات التالية:
- تشغيل وإيقاف الصوت
- التحكم في مستوى الصوت
- التنقل بين السور
- عرض معلومات السورة والقارئ
- شريط التقدم التفاعلي
- تمييز الآيات أثناء التشغيل

#### الاستخدام:
```jsx
import QuranAudioPlayer from './AudioPlayer/QuranAudioPlayer';

<QuranAudioPlayer
  surahNumber={1}
  reciterId={1}
  onSurahChange={(newSurah) => console.log(newSurah)}
  showAyahHighlight={true}
  svgRef={svgRef}
  textRef={textRef}
/>
```

### AyahHighlight.jsx
مكون تمييز الآيات أثناء التشغيل الصوتي:
- تمييز الآية الحالية على SVG
- تمييز الآية في النص
- انتقال سلس بين الآيات
- دعم أنماط تمييز متعددة

#### الاستخدام:
```jsx
import AyahHighlight from './AudioPlayer/AyahHighlight';

<AyahHighlight
  currentAyah={currentAyah}
  ayahTimings={ayahTimings}
  svgRef={svgRef}
  textRef={textRef}
  highlightMode="svg" // أو "text"
/>
```

### tafseer_popup.js
نافذة منبثقة لعرض تفسير الآيات:
- جلب التفسير من مصادر متعددة
- عرض نص الآية
- إمكانية المشاركة والحفظ
- واجهة مستخدم جذابة

#### الاستخدام:
```jsx
import TafseerPopup from './AudioPlayer/tafseer_popup';

<TafseerPopup
  open={showTafseer}
  onClose={() => setShowTafseer(false)}
  surahNumber={1}
  ayahNumber={1}
  ayahText="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
  surahName="الفاتحة"
/>
```

## الميزات العامة

### تمييز الآيات
- دعم تمييز الآيات على صفحات SVG
- تمييز الآيات في النص العادي
- انتقال سلس وتأثيرات بصرية

### التحكم في الصوت
- تشغيل وإيقاف
- التحكم في مستوى الصوت
- التنقل بين السور
- تكرار التشغيل

### التفسير
- جلب التفسير من مصادر متعددة
- عرض تفاسير مختلفة
- إمكانية المشاركة والحفظ

## متطلبات النظام

- React 18+
- Material-UI 5+
- Next.js 13+

## ملاحظات التطوير

- جميع المكونات تدعم الـ RTL
- تصميم متجاوب
- أداء محسن
- إمكانية الوصول (Accessibility)

## API المطلوبة

### بيانات الصوت
```
/json/audio/audio_surah_{surahNumber}.json
```

### معلومات السور
```
/json/metadata.json
```

### توقيتات الآيات
```
https://mp3quran.net/api/v3/ayat_timing?surah={surahNumber}&read={reciterId}
```

### التفسير
```
http://api.quran-tafseer.com/tafseer/{tafseer_id}/{surah}/{ayah}
```
