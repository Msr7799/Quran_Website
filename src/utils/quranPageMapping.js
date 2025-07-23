// ملف تعيين صفحات المصحف مع السور والآيات
// هذا ملف مبسط - يحتاج لبيانات دقيقة من مصدر موثوق

export const quranPageMapping = {
  1: {
    surahs: [
      { id: 1, name: 'الفاتحة', startAyah: 1, endAyah: 7 }
    ],
    juz: 1,
    hizb: 1
  },
  2: {
    surahs: [
      { id: 2, name: 'البقرة', startAyah: 1, endAyah: 5 }
    ],
    juz: 1,
    hizb: 1
  },
  3: {
    surahs: [
      { id: 2, name: 'البقرة', startAyah: 6, endAyah: 16 }
    ],
    juz: 1,
    hizb: 1
  },
  // ... باقي الصفحات
  // هذا مجرد مثال - يحتاج لبيانات كاملة ودقيقة
};

// دالة للحصول على معلومات الصفحة
export const getPageInfo = (pageNumber) => {
  const pageData = quranPageMapping[pageNumber];
  
  if (!pageData) {
    // إرجاع بيانات افتراضية إذا لم توجد بيانات للصفحة
    return {
      surahs: [{ id: 1, name: 'الفاتحة', startAyah: 1, endAyah: 7 }],
      juz: Math.ceil(pageNumber / 20), // تقدير تقريبي
      hizb: Math.ceil(pageNumber / 10), // تقدير تقريبي
      ayahRange: '1-7'
    };
  }

  // تكوين نطاق الآيات
  const ayahRange = pageData.surahs.length === 1 
    ? `${pageData.surahs[0].startAyah}-${pageData.surahs[0].endAyah}`
    : `${pageData.surahs[0].startAyah}-${pageData.surahs[pageData.surahs.length - 1].endAyah}`;

  return {
    ...pageData,
    ayahRange,
    surah: pageData.surahs[0].name // السورة الرئيسية في الصفحة
  };
};

// دالة للحصول على السورة الرئيسية في الصفحة
export const getMainSurahForPage = (pageNumber) => {
  const pageInfo = getPageInfo(pageNumber);
  return pageInfo.surahs[0];
};

// دالة للحصول على جميع السور في الصفحة
export const getSurahsInPage = (pageNumber) => {
  const pageInfo = getPageInfo(pageNumber);
  return pageInfo.surahs;
};

// دالة للبحث عن الصفحة التي تحتوي على سورة معينة
export const findPageBySurah = (surahId) => {
  for (const [pageNumber, pageData] of Object.entries(quranPageMapping)) {
    const hasSurah = pageData.surahs.some(surah => surah.id === surahId);
    if (hasSurah) {
      return parseInt(pageNumber);
    }
  }
  
  // إرجاع الصفحة الأولى كافتراضي
  return 1;
};

// دالة للحصول على الصفحة التي تحتوي على آية معينة
export const findPageByAyah = (surahId, ayahNumber) => {
  for (const [pageNumber, pageData] of Object.entries(quranPageMapping)) {
    const surahInPage = pageData.surahs.find(surah => 
      surah.id === surahId && 
      ayahNumber >= surah.startAyah && 
      ayahNumber <= surah.endAyah
    );
    
    if (surahInPage) {
      return parseInt(pageNumber);
    }
  }
  
  // إرجاع الصفحة الأولى كافتراضي
  return 1;
};

// قائمة أسماء السور (مبسطة)
export const surahNames = {
  1: 'الفاتحة',
  2: 'البقرة',
  3: 'آل عمران',
  4: 'النساء',
  5: 'المائدة',
  6: 'الأنعام',
  7: 'الأعراف',
  8: 'الأنفال',
  9: 'التوبة',
  10: 'يونس',
  11: 'هود',
  12: 'يوسف',
  13: 'الرعد',
  14: 'إبراهيم',
  15: 'الحجر',
  16: 'النحل',
  17: 'الإسراء',
  18: 'الكهف',
  19: 'مريم',
  20: 'طه',
  21: 'الأنبياء',
  22: 'الحج',
  23: 'المؤمنون',
  24: 'النور',
  25: 'الفرقان',
  26: 'الشعراء',
  27: 'النمل',
  28: 'القصص',
  29: 'العنكبوت',
  30: 'الروم',
  31: 'لقمان',
  32: 'السجدة',
  33: 'الأحزاب',
  34: 'سبأ',
  35: 'فاطر',
  36: 'يس',
  37: 'الصافات',
  38: 'ص',
  39: 'الزمر',
  40: 'غافر',
  41: 'فصلت',
  42: 'الشورى',
  43: 'الزخرف',
  44: 'الدخان',
  45: 'الجاثية',
  46: 'الأحقاف',
  47: 'محمد',
  48: 'الفتح',
  49: 'الحجرات',
  50: 'ق',
  51: 'الذاريات',
  52: 'الطور',
  53: 'النجم',
  54: 'القمر',
  55: 'الرحمن',
  56: 'الواقعة',
  57: 'الحديد',
  58: 'المجادلة',
  59: 'الحشر',
  60: 'الممتحنة',
  61: 'الصف',
  62: 'الجمعة',
  63: 'المنافقون',
  64: 'التغابن',
  65: 'الطلاق',
  66: 'التحريم',
  67: 'الملك',
  68: 'القلم',
  69: 'الحاقة',
  70: 'المعارج',
  71: 'نوح',
  72: 'الجن',
  73: 'المزمل',
  74: 'المدثر',
  75: 'القيامة',
  76: 'الإنسان',
  77: 'المرسلات',
  78: 'النبأ',
  79: 'النازعات',
  80: 'عبس',
  81: 'التكوير',
  82: 'الانفطار',
  83: 'المطففين',
  84: 'الانشقاق',
  85: 'البروج',
  86: 'الطارق',
  87: 'الأعلى',
  88: 'الغاشية',
  89: 'الفجر',
  90: 'البلد',
  91: 'الشمس',
  92: 'الليل',
  93: 'الضحى',
  94: 'الشرح',
  95: 'التين',
  96: 'العلق',
  97: 'القدر',
  98: 'البينة',
  99: 'الزلزلة',
  100: 'العاديات',
  101: 'القارعة',
  102: 'التكاثر',
  103: 'العصر',
  104: 'الهمزة',
  105: 'الفيل',
  106: 'قريش',
  107: 'الماعون',
  108: 'الكوثر',
  109: 'الكافرون',
  110: 'النصر',
  111: 'المسد',
  112: 'الإخلاص',
  113: 'الفلق',
  114: 'الناس'
};

// دالة للحصول على اسم السورة
export const getSurahName = (surahId) => {
  return surahNames[surahId] || `سورة ${surahId}`;
};
