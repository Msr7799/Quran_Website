// src/utils/pageMapping.js - مساعد لربط الصفحات بالسور والآيات

/**
 * خريطة تقريبية لربط صفحات المصحف بالسور والآيات
 * هذه البيانات تحتاج لتحديث دقيق بناءً على المصحف المستخدم
 */
const PAGE_MAPPING = {
  1: { surahs: [1], ayahRanges: { 1: [1, 7] }, juz: 1, hizb: 1 },
  2: { surahs: [2], ayahRanges: { 2: [1, 5] }, juz: 1, hizb: 1 },
  3: { surahs: [2], ayahRanges: { 2: [6, 16] }, juz: 1, hizb: 1 },
  // يمكن إضافة المزيد من الصفحات هنا
};

/**
 * الحصول على معلومات الصفحة
 * @param {number} pageNumber - رقم الصفحة
 * @returns {Object} معلومات الصفحة
 */
export const getPageInfo = async (pageNumber) => {
  try {
    // تحميل metadata للحصول على معلومات السور
    const metadataResponse = await fetch('/json/metadata.json');
    const metadata = await metadataResponse.json();
    
    // الحصول على mapping الصفحة
    const pageMapping = PAGE_MAPPING[pageNumber];
    
    if (!pageMapping) {
      // إذا لم توجد بيانات محددة، نرجع بيانات افتراضية
      return {
        pageNumber,
        surahs: [],
        ayahRanges: {},
        juz: Math.ceil(pageNumber / 20), // تقدير تقريبي
        hizb: Math.ceil(pageNumber / 10), // تقدير تقريبي
        displayName: `صفحة ${pageNumber}`
      };
    }
    
    // جلب معلومات السور
    const surahsInfo = pageMapping.surahs.map(surahNum => {
      const surahData = metadata.find(s => s.number === surahNum);
      return {
        ...surahData,
        ayahRange: pageMapping.ayahRanges[surahNum] || [1, surahData?.verses_count || 1]
      };
    });
    
    // تكوين اسم العرض
    let displayName = '';
    if (surahsInfo.length === 1) {
      const surah = surahsInfo[0];
      const [startAyah, endAyah] = surah.ayahRange;
      displayName = `${surah.name.ar}`;
      if (startAyah !== 1 || endAyah !== surah.verses_count) {
        displayName += ` (${startAyah}-${endAyah})`;
      }
    } else if (surahsInfo.length > 1) {
      displayName = surahsInfo.map(s => s.name.ar).join(' - ');
    } else {
      displayName = `صفحة ${pageNumber}`;
    }
    
    return {
      pageNumber,
      surahs: surahsInfo,
      ayahRanges: pageMapping.ayahRanges,
      juz: pageMapping.juz,
      hizb: pageMapping.hizb,
      displayName
    };
    
  } catch (error) {
    console.error('خطأ في جلب معلومات الصفحة:', error);
    return {
      pageNumber,
      surahs: [],
      ayahRanges: {},
      juz: 1,
      hizb: 1,
      displayName: `صفحة ${pageNumber}`
    };
  }
};

/**
 * الحصول على السورة الرئيسية في الصفحة
 * @param {number} pageNumber - رقم الصفحة
 * @returns {number} رقم السورة الرئيسية
 */
export const getMainSurahForPage = (pageNumber) => {
  const pageMapping = PAGE_MAPPING[pageNumber];
  if (pageMapping && pageMapping.surahs.length > 0) {
    return pageMapping.surahs[0];
  }
  
  // تقدير تقريبي بناءً على رقم الصفحة
  if (pageNumber === 1) return 1; // الفاتحة
  if (pageNumber <= 48) return 2; // البقرة
  if (pageNumber <= 76) return 3; // آل عمران
  if (pageNumber <= 106) return 4; // النساء
  if (pageNumber <= 128) return 5; // المائدة
  
  // للصفحات الأخرى، نرجع تقدير تقريبي
  return Math.min(114, Math.ceil(pageNumber / 5));
};

/**
 * البحث عن الصفحة التي تحتوي على آية معينة
 * @param {number} surahNumber - رقم السورة
 * @param {number} ayahNumber - رقم الآية
 * @returns {number|null} رقم الصفحة أو null إذا لم توجد
 */
export const findPageForAyah = (surahNumber, ayahNumber) => {
  for (const [pageNum, mapping] of Object.entries(PAGE_MAPPING)) {
    if (mapping.surahs.includes(surahNumber)) {
      const ayahRange = mapping.ayahRanges[surahNumber];
      if (ayahRange && ayahNumber >= ayahRange[0] && ayahNumber <= ayahRange[1]) {
        return parseInt(pageNum);
      }
    }
  }
  
  // إذا لم نجد mapping محدد، نرجع تقدير تقريبي
  if (surahNumber === 1) return 1;
  if (surahNumber === 2) {
    if (ayahNumber <= 141) return Math.ceil(ayahNumber / 6) + 1;
    return Math.ceil(ayahNumber / 6) + 1;
  }
  
  // تقدير عام للسور الأخرى
  return Math.min(604, (surahNumber - 1) * 5 + Math.ceil(ayahNumber / 10));
};

/**
 * الحصول على قائمة الصفحات لسورة معينة
 * @param {number} surahNumber - رقم السورة
 * @returns {Array<number>} قائمة أرقام الصفحات
 */
export const getPagesForSurah = (surahNumber) => {
  const pages = [];
  
  for (const [pageNum, mapping] of Object.entries(PAGE_MAPPING)) {
    if (mapping.surahs.includes(surahNumber)) {
      pages.push(parseInt(pageNum));
    }
  }
  
  // إذا لم نجد صفحات محددة، نرجع تقدير
  if (pages.length === 0) {
    if (surahNumber === 1) return [1];
    if (surahNumber === 2) return Array.from({ length: 47 }, (_, i) => i + 2);
    
    // تقدير عام
    const startPage = (surahNumber - 1) * 5;
    const endPage = Math.min(604, startPage + 10);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
  
  return pages.sort((a, b) => a - b);
};

export default {
  getPageInfo,
  getMainSurahForPage,
  findPageForAyah,
  getPagesForSurah
};
