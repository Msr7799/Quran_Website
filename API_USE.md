
# 📚 دليل استخدام API ومصادر البيانات

## 🎯 نظرة عامة

هذا الدليل يوضح كيفية استخدام البيانات المحلية والـ APIs الخارجية في مشروع القرآن الكريم.

## 📁 البيانات المحلية

### 🗂️ هيكل المجلدات

| المسار | الوصف | عدد الملفات |
|--------|--------|-------------|
| `public/json/audio/` | ملفات الصوت لكل سورة | 114 ملف |
| `public/json/surah/` | بيانات السور بالخط العثماني | 114 ملف |
| `public/json/verses/` | ملفات الآيات الفردية | 6,236 ملف |
| `public/json/metadata.json` | البيانات الوصفية الشاملة | 1 ملف |
| `public/json/quranMp3.json` | قائمة القراء والخوادم | 158+ قارئ |

## 🌐 APIs الخارجية

### 📄 جلب صفحات القرآن (SVG)

يستخدم لعمل تظليل على الآيات وإبرازها:

```javascript
// جلب صورة الصفحة بصيغة SVG من mp3quran.net
const svgUrl = `https://www.mp3quran.net/api/quran_pages_svg/${pageNum.toString().padStart(3, '0')}.svg`;
const mushafPage = document.getElementById('mushafPage');
```

### 🎵 جلب توقيتات القراءات

#### 📋 جلب قائمة جميع القراء

**Endpoint:** `GET https://mp3quran.net/api/v3/ayat_timing/reads`

**Response:**
```json
[
  {
    "id": 5,
    "name": "أحمد بن علي العجمي",
    "rewaya": "حفص عن عاصم",
    "folder_url": "https://server10.mp3quran.net/ajm/",
    "soar_count": 114,
    "soar_link": "http://mp3quran.de/api/v3/ayat_timing/soar?read=5"
  }
]
```

#### 🎧 الوصول لملفات الصوت

**مثال خادم:** `https://server10.mp3quran.net/ajm/`

يحتوي على 114 ملف MP3 لجميع سور القرآن

#### 📖 جلب سور القارئ

**Endpoint:** `GET https://mp3quran.net/api/v3/ayat_timing/soar?read={RECITER_ID}`

**مثال:** القارئ رقم 5

**Response:**

```json
[
  {
    "id": 1,
    "name": "الفاتحة",
    "timing_link": "http://mp3quran.de/api/v3/ayat_timing?surah=1&read=5"
  },
  {
    "id": 2,
    "name": "البقرة",
    "timing_link": "http://mp3quran.de/api/v3/ayat_timing?surah=2&read=5"
  }
]
```

#### ⏱️ جلب توقيتات الآيات

**Endpoint:** `GET https://mp3quran.net/api/v3/ayat_timing?surah={SURAH_ID}&read={RECITER_ID}`

**Parameters:**
- `surah`: رقم السورة (1-114)
- `read`: رقم القارئ

**مثال:** سورة البقرة (2) للقارئ رقم 5

**Response Structure:**

```json
[
  {
    "ayah": 0,
    "polygon": null,
    "start_time": 0,
    "end_time": 5587,
    "x": null,
    "y": null,
    "page": null
  },
  {
    "ayah": 1,
    "polygon": "206.48,46.08 172.36,46.08 172.36,72.23 206.48,72.23",
    "start_time": 5587,
    "end_time": 12658,
    "x": "178.34",
    "y": "63.11",
    "page": "https://www.mp3quran.net/api/quran_pages_svg/002.svg"
  }
]
```

**شرح الحقول:**

- `ayah`: رقم الآية (0 للبسملة)
- `polygon`: إحداثيات المضلع للتظليل
- `start_time`: وقت بداية الآية (بالميلي ثانية)
- `end_time`: وقت نهاية الآية (بالميلي ثانية)
- `x`, `y`: موقع الآية في صورة SVG
- `page`: رابط صفحة SVG

### 📖 جلب التفسير

**Endpoint:** `http://api.quran-tafseer.com/quran/{surahNum}/{verseNum}`

```javascript
const response = await fetch(`http://api.quran-tafseer.com/quran/${surahNum}/${verseNum}`);
if (response.ok) {
  const data = await response.json();
  return {
    text: data.text || `آية ${verseNum} من سورة ${surahNum}`,
    surahName: data.sura_name || `سورة رقم ${surahNum}`
  };
}
```

---

# 📊 تقرير شامل لتحليل بيانات JSON

**تاريخ التقرير:** 2025-07-21
**المشروع:** تطبيق القرآن الكريم
**المسار:** `C:\Users\alrom\Desktop\MyApp\test_quran_app\public\json`

## 📈 إحصائيات الملفات

### 📊 عدد الملفات

- **ملفات الصوت:** 114 ملف
- **ملفات السور:** 114 ملف
- **ملفات الآيات:** 6,236 ملف
- **الملفات الرئيسية:** 2 ملف

### 📈 إحصائيات البيانات

- **السور:** 114 سورة
- **الآيات:** 6,236 آية
- **الكلمات:** 77,429 كلمة
- **الحروف:** 323,015 حرف
- **القراء:** 158+ قارئ

===============================================
           هيكل المجلدات والملفات
===============================================

1. مجلد /audio (114 ملف)
   المحتوى: ملفات صوتية لكل سورة منفصلة
   التنسيق: audio_surah_X.json حيث X = رقم السورة
   البيانات: معلومات القراء، الروايات، روابط الخوادم

2. مجلد /surah (114 ملف)
   المحتوى: بيانات كاملة لكل سورة مع آياتها
   التنسيق: surah_X.json حيث X = رقم السورة
   البيانات: معلومات السورة + جميع الآيات + ملفات الصوت

3. مجلد /verses (6,236 ملف)
   المحتوى: ملف منفصل لكل آية
   التنسيق: XXX_YYY.json حيث XXX = السورة، YYY = الآية
   البيانات: نص الآية، الجزء، الصفحة، السجدة

4. الملفات الرئيسية:
   - metadata.json: بيانات وصفية شاملة لجميع السور
   - quranMp3.json: قائمة بجميع القراء وخوادمهم

===============================================
           دليل جلب البيانات
===============================================

1. البيانات الوصفية الرئيسية:
   المسار: public/json/metadata.json
   المحتوى: معلومات شاملة عن جميع السور
   الاستخدام: 
   const metadata = await fetch('/json/metadata.json').then(res => res.json());
   يحتوي على: رقم السورة، الاسم، مكان النزول، عدد الآيات، الكلمات، الحروف

2. قائمة القراء والخوادم:
   المسار: public/json/quranMp3.json
   المحتوى: قائمة بجميع القراء وخوادم الصوت
   الاستخدام:
   const reciters = await fetch('/json/quranMp3.json').then(res => res.json());
   يحتوي على: معرف القارئ، الاسم، الرواية، رابط الخادم

3. بيانات سورة كاملة:
   المسار: public/json/surah/surah_{رقم_السورة}.json
   مثال: public/json/surah/surah_1.json
   الاستخدام:
   const surah = await fetch('/json/surah/surah_1.json').then(res => res.json());
   المحتوى:
   - معلومات السورة (الاسم، مكان النزول، عدد الآيات)
   - جميع آيات السورة مع النص العربي والإنجليزي
   - معلومات إضافية (الجزء، الصفحة، السجدة)
   - قائمة كاملة بالملفات الصوتية لجميع القراء

4. آية منفردة:
   المسار: public/json/verses/{رقم_السورة}_{رقم_الآية}.json
   مثال: public/json/verses/001_001.json
   الاستخدام:
   const verse = await fetch('/json/verses/001_001.json').then(res => res.json());
   المحتوى:
   - رقم الآية
   - النص العربي والإنجليزي
   - رقم الجزء
   - رقم الصفحة
   - معلومات السجدة

5. ملفات صوتية لسورة:
   المسار: public/json/audio/audio_surah_{رقم_السورة}.json
   مثال: public/json/audio/audio_surah_1.json
   الاستخدام:
   const audioFiles = await fetch('/json/audio/audio_surah_1.json').then(res => res.json());
   المحتوى:
   - قائمة بجميع القراء المتاحين للسورة
   - معلومات القارئ (الاسم العربي والإنجليزي)
   - الرواية المستخدمة
   - رابط الخادم
   - الرابط المباشر لملف MP3

===============================================
           أمثلة عملية للاستخدام
===============================================

1. جلب بيانات سورة الفاتحة كاملة:
async function getFatiha() {
    const surah = await fetch('/json/surah/surah_1.json').then(res => res.json());
    console.log('اسم السورة:', surah.name.ar);
    console.log('عدد الآيات:', surah.verses_count);
    console.log('الآيات:', surah.verses);
    console.log('الملفات الصوتية:', surah.audio);
}

2. جلب آية محددة:
async function getVerse(surahNum, verseNum) {
    const paddedSurah = surahNum.toString().padStart(3, '0');
    const paddedVerse = verseNum.toString().padStart(3, '0');
    const verse = await fetch(`/json/verses/${paddedSurah}_${paddedVerse}.json`).then(res => res.json());
    return verse;
}

مثال: جلب آية الكرسي (البقرة 255)
const ayatAlKursi = await getVerse(2, 255);

3. جلب قائمة القراء:
async function getReciters() {
    const reciters = await fetch('/json/quranMp3.json').then(res => res.json());
    return reciters.map(reciter => ({
        id: reciter.id,
        name: reciter.reciter.ar,
        englishName: reciter.reciter.en,
        rewaya: reciter.rewaya.ar,
        server: reciter.server
    }));
}

4. بناء رابط ملف صوتي:
function buildAudioUrl(reciterServer, surahNumber) {
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    return `${reciterServer}/${paddedSurah}.mp3`;
}

مثال: رابط سورة الفاتحة للسديس
const audioUrl = buildAudioUrl('https://server11.mp3quran.net/sds', 1);
النتيجة: https://server11.mp3quran.net/sds/001.mp3

===============================================
           الروايات المتوفرة
===============================================

1. حفص عن عاصم (الأكثر شيوعاً)
2. ورش عن نافع
3. قالون عن نافع
4. الدوري عن أبي عمرو
5. البزي عن ابن كثير
6. قنبل عن ابن كثير
7. شعبة عن عاصم
8. السوسي عن أبي عمرو
9. خلف عن حمزة
10. الدوري عن الكسائي

===============================================
           نصائح للاستخدام
===============================================

1. استخدم التخزين المؤقت للبيانات المتكررة
2. اجلب البيانات حسب الحاجة لتحسين الأداء
3. استخدم ملفات السور للحصول على بيانات شاملة
4. استخدم ملفات الآيات للوصول السريع لآية محددة
5. تأكد من معالجة الأخطاء عند جلب البيانات
6. استخدم async/await لتحسين تجربة المستخدم
7. قم بضغط البيانات عند الإمكان لتوفير عرض النطاق

===============================================
           معلومات تقنية إضافية
===============================================

- تنسيق الملفات: JSON
- ترميز النصوص: UTF-8
- حجم البيانات الإجمالي: ~50+ MB
- متوافق مع جميع المتصفحات الحديثة
- يدعم التحميل التدريجي للبيانات
- مُحسن للأداء والسرعة

===============================================
           ملاحظات مهمة
===============================================

1. جميع أرقام السور والآيات تبدأ من 1
2. أرقام الملفات مُرقمة بثلاثة أرقام (001, 002, إلخ)
3. النصوص العربية مُرمزة بـ UTF-8
4. روابط الصوت تشير إلى خوادم خارجية
5. البيانات محدثة ومطابقة للمصحف الشريف
6. يُنصح بالتحقق من توفر الملفات قبل الاستخدام

===============================================
                نهاية التقرير
===============================================

تم إنشاء هذا التقرير لمساعدتك في فهم واستخدام بيانات JSON 
الخاصة بتطبيق القرآن الكريم بكفاءة وفعالية.
