// وحدة لقراءة الأحاديث من الملفات المحلية
// تدعم قراءة أحاديث صحيح البخاري ومسلم

import fs from 'fs';
import path from 'path';

class HadithDataReader {
  constructor() {
    this.hadithData = null;
    this.dataFilePath = path.join(process.cwd(), 'public', 'AlSahihehan', 'myData.json');
    this.isDataLoaded = false;
  }

  /**
   * تحميل بيانات الأحاديث من الملف المحلي
   */
  async loadHadithData() {
    if (this.isDataLoaded && this.hadithData) {
      return this.hadithData;
    }

    try {
      console.log('📖 تحميل بيانات الأحاديث من الملف المحلي...');
      
      // التحقق من وجود الملف
      if (!fs.existsSync(this.dataFilePath)) {
        throw new Error(`ملف البيانات غير موجود في المسار: ${this.dataFilePath}`);
      }

      // قراءة وتحليل ملف JSON
      const rawData = fs.readFileSync(this.dataFilePath, 'utf8');
      this.hadithData = JSON.parse(rawData);
      
      if (!Array.isArray(this.hadithData) || this.hadithData.length === 0) {
        throw new Error('بيانات الأحاديث فارغة أو غير صحيحة');
      }

      this.isDataLoaded = true;
      console.log(`✅ تم تحميل ${this.hadithData.length} حديث من الملف المحلي`);
      
      return this.hadithData;

    } catch (error) {
      console.error('❌ خطأ في تحميل بيانات الأحاديث:', error.message);
      throw new Error(`فشل في تحميل بيانات الأحاديث: ${error.message}`);
    }
  }

  /**
   * الحصول على حديث عشوائي
   * @param {string} source - المصدر المطلوب ('صحيح البخاري' أو 'صحيح مسلم' أو null للكل)
   * @returns {Object} حديث عشوائي
   */
  async getRandomHadith(source = null) {
    try {
      await this.loadHadithData();
      
      let filteredHadiths = this.hadithData;
      
      // فلترة حسب المصدر إذا تم تحديده
      if (source) {
        filteredHadiths = this.hadithData.filter(hadith => 
          hadith.source && hadith.source.includes(source)
        );
        
        if (filteredHadiths.length === 0) {
          console.warn(`⚠️ لم يتم العثور على أحاديث من المصدر: ${source}`);
          filteredHadiths = this.hadithData; // العودة للكل في حالة عدم وجود نتائج
        }
      }

      // اختيار حديث عشوائي
      const randomIndex = Math.floor(Math.random() * filteredHadiths.length);
      const selectedHadith = filteredHadiths[randomIndex];

      // تنظيم البيانات بتنسيق متوافق مع النظام الحالي
      const formattedHadith = {
        hadithText: selectedHadith.hadith || selectedHadith.uhadith,
        book: selectedHadith.source || 'غير محدد',
        englishNarrator: 'غير محدد', // يمكن إضافة هذه المعلومة لاحقاً
        hadithNumber: selectedHadith.id?.toString() || 'غير محدد',
        chapter: 'غير محدد', // يمكن إضافة هذه المعلومة لاحقاً
        id: selectedHadith.id,
        source: selectedHadith.source
      };

      console.log(`📜 تم اختيار حديث من: ${formattedHadith.book} - رقم: ${formattedHadith.hadithNumber}`);
      console.log(`📄 بداية الحديث: ${formattedHadith.hadithText?.substring(0, 100)}...`);

      return formattedHadith;

    } catch (error) {
      console.error('❌ خطأ في الحصول على حديث عشوائي:', error.message);
      throw error;
    }
  }

  /**
   * الحصول على أحاديث حسب المصدر
   * @param {string} source - المصدر المطلوب
   * @returns {Array} قائمة بالأحاديث
   */
  async getHadithsBySource(source) {
    try {
      await this.loadHadithData();
      
      const filteredHadiths = this.hadithData.filter(hadith => 
        hadith.source && hadith.source.includes(source)
      );

      console.log(`📚 تم العثور على ${filteredHadiths.length} حديث من ${source}`);
      return filteredHadiths;

    } catch (error) {
      console.error('❌ خطأ في الحصول على أحاديث حسب المصدر:', error.message);
      throw error;
    }
  }

  /**
   * البحث في الأحاديث
   * @param {string} searchTerm - كلمة البحث
   * @param {string} source - المصدر (اختياري)
   * @returns {Array} قائمة بالأحاديث المطابقة
   */
  async searchHadiths(searchTerm, source = null) {
    try {
      await this.loadHadithData();
      
      let filteredHadiths = this.hadithData;
      
      // فلترة حسب المصدر إذا تم تحديده
      if (source) {
        filteredHadiths = this.hadithData.filter(hadith => 
          hadith.source && hadith.source.includes(source)
        );
      }

      // البحث في نص الحديث
      const searchResults = filteredHadiths.filter(hadith => 
        (hadith.hadith && hadith.hadith.includes(searchTerm)) ||
        (hadith.uhadith && hadith.uhadith.includes(searchTerm))
      );

      console.log(`🔍 تم العثور على ${searchResults.length} حديث يحتوي على: "${searchTerm}"`);
      return searchResults;

    } catch (error) {
      console.error('❌ خطأ في البحث في الأحاديث:', error.message);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات البيانات
   * @returns {Object} إحصائيات
   */
  async getDataStats() {
    try {
      await this.loadHadithData();
      
      const bukhariCount = this.hadithData.filter(h => 
        h.source && h.source.includes('البخاري')
      ).length;
      
      const muslimCount = this.hadithData.filter(h => 
        h.source && h.source.includes('مسلم')
      ).length;

      const stats = {
        total: this.hadithData.length,
        bukhari: bukhariCount,
        muslim: muslimCount,
        other: this.hadithData.length - bukhariCount - muslimCount
      };

      console.log('📊 إحصائيات بيانات الأحاديث:', stats);
      return stats;

    } catch (error) {
      console.error('❌ خطأ في الحصول على إحصائيات البيانات:', error.message);
      throw error;
    }
  }

  /**
   * إعادة تحميل البيانات (مفيد للتحديثات)
   */
  async reloadData() {
    this.isDataLoaded = false;
    this.hadithData = null;
    return await this.loadHadithData();
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
const hadithReader = new HadithDataReader();

export default hadithReader;

// تصدير الكلاس أيضاً للاستخدام المتقدم
export { HadithDataReader };
