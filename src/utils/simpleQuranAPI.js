// API بسيط ونظيف لتطبيق القرآن الكريم
// يستخدم البيانات المحلية فقط ولا يحمل أي بيانات إلا عند الحاجة الفعلية

/**
 * جلب بيانات السور من الملف المحلي
 * @returns {Promise<Array>} قائمة السور
 */
export const fetchSurahsMetadata = async () => {
  try {
    const response = await fetch('/json/metadata.json');
    if (!response.ok) {
      throw new Error(`فشل في جلب بيانات السور: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('خطأ في جلب بيانات السور:', error);
    return [];
  }
};

/**
 * جلب قائمة القراء من الملف المحلي
 * @returns {Promise<Array>} قائمة القراء
 */
export const fetchRecitersData = async () => {
  try {
    const response = await fetch('/json/quranMp3.json');
    if (!response.ok) {
      throw new Error(`فشل في جلب بيانات القراء: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('خطأ في جلب بيانات القراء:', error);
    return [];
  }
};

/**
 * جلب رابط الصوت لسورة محددة وقارئ محدد
 * هذه الدالة تحمل فقط ملف السورة المطلوبة وليس كل البيانات
 * @param {number} surahNumber - رقم السورة (1-114)
 * @param {number} reciterId - رقم القارئ
 * @returns {Promise<string|null>} رابط الملف الصوتي أو null
 */
export const getAudioUrlForSurah = async (surahNumber, reciterId) => {
  // التحقق من صحة المدخلات
  if (!surahNumber || !reciterId) {
    console.log('❌ بيانات غير مكتملة - السورة:', surahNumber, 'القارئ:', reciterId);
    return null;
  }

  if (surahNumber < 1 || surahNumber > 114) {
    console.error('❌ رقم السورة غير صحيح:', surahNumber);
    return null;
  }

  try {
    console.log(`🔍 جلب رابط الصوت للسورة ${surahNumber} والقارئ ${reciterId}`);
    
    // جلب ملف السورة المحددة فقط
    const response = await fetch(`/json/audio/audio_surah_${surahNumber}.json`);
    
    if (!response.ok) {
      console.error(`❌ فشل في جلب ملف السورة ${surahNumber}:`, response.status);
      return null;
    }
    
    const audioData = await response.json();
    console.log(`✅ تم تحميل بيانات السورة ${surahNumber} - عدد القراء: ${audioData.length}`);
    
    // البحث عن القارئ المحدد
    const reciterData = audioData.find(item => item.id === reciterId);
    
    if (reciterData && reciterData.link) {
      console.log(`🎵 تم العثور على رابط الصوت:`, {
        surah: surahNumber,
        reciter: reciterData.reciter.ar,
        rewaya: reciterData.rewaya.ar,
        url: reciterData.link
      });
      return reciterData.link;
    } else {
      console.warn(`⚠️ لم يتم العثور على القارئ ${reciterId} في السورة ${surahNumber}`);
      return null;
    }
    
  } catch (error) {
    console.error('❌ خطأ في جلب رابط الصوت:', error);
    return null;
  }
};

/**
 * التحقق من صحة رقم السورة
 * @param {any} surahNumber - رقم السورة للتحقق منه
 * @returns {boolean} true إذا كان الرقم صحيح
 */
export const isValidSurahNumber = (surahNumber) => {
  return surahNumber && 
         typeof surahNumber === 'number' && 
         surahNumber >= 1 && 
         surahNumber <= 114;
};

/**
 * التحقق من صحة رقم القارئ
 * @param {any} reciterId - رقم القارئ للتحقق منه
 * @returns {boolean} true إذا كان الرقم صحيح
 */
export const isValidReciterId = (reciterId) => {
  return reciterId && 
         typeof reciterId === 'number' && 
         reciterId > 0;
};

/**
 * تنسيق الوقت للعرض (MM:SS)
 * @param {number} seconds - الوقت بالثواني
 * @returns {string} الوقت المنسق
 */
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * البحث عن سورة بالرقم في قائمة السور
 * @param {Array} surahs - قائمة السور
 * @param {number} surahNumber - رقم السورة
 * @returns {Object|null} بيانات السورة أو null
 */
export const findSurahByNumber = (surahs, surahNumber) => {
  if (!Array.isArray(surahs) || !surahNumber) return null;
  return surahs.find(surah => surah.number === surahNumber) || null;
};

/**
 * البحث عن قارئ بالرقم في قائمة القراء
 * @param {Array} reciters - قائمة القراء
 * @param {number} reciterId - رقم القارئ
 * @returns {Object|null} بيانات القارئ أو null
 */
export const findReciterById = (reciters, reciterId) => {
  if (!Array.isArray(reciters) || !reciterId) return null;
  return reciters.find(reciter => reciter.id === reciterId) || null;
};

// تصدير جميع الدوال كـ default
export default {
  fetchSurahsMetadata,
  fetchRecitersData,
  getAudioUrlForSurah,
  isValidSurahNumber,
  isValidReciterId,
  formatTime,
  findSurahByNumber,
  findReciterById
};
