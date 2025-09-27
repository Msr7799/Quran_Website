// وحدة لقراءة الأحاديث من MongoDB Atlas مع fallback للملفات المحلية
// تدعم قراءة أحاديث صحيح البخاري ومسلم

import fs from 'fs';
import path from 'path';
import { connectToDatabase } from './mongoDataStorage.js';

class HadithDataReader {
  constructor() {
    this.hadithData = null;
    this.dataFilePath = path.join(process.cwd(), 'public', 'AlSahihehan', 'myData.json');
    this.isDataLoaded = false;
    this.db = null;
    this.preferMongoDB = true; // تفضيل MongoDB أولاً
  }

  /**
   * الاتصال بقاعدة البيانات MongoDB
   */
  async connectToDB() {
    if (!this.db) {
      try {
        const { db } = await connectToDatabase();
        this.db = db;
        console.log('✅ تم الاتصال بـ MongoDB Atlas للأحاديث');
      } catch (error) {
        console.warn('⚠️ فشل الاتصال بـ MongoDB، سيتم استخدام الملف المحلي:', error.message);
        this.preferMongoDB = false;
      }
    }
    return this.db;
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
   * الحصول على حديث عشوائي من MongoDB أو الملف المحلي
   * @param {string} source - المصدر المطلوب ('البخاري' أو 'مسلم' أو null للكل)
   * @returns {Object} حديث عشوائي
   */
  async getRandomHadith(source = null) {
    // المحاولة الأولى: MongoDB Atlas
    if (this.preferMongoDB) {
      try {
        const hadith = await this.getRandomHadithFromMongoDB(source);
        if (hadith) {
          return hadith;
        }
      } catch (error) {
        console.warn('⚠️ فشل في الحصول على حديث من MongoDB:', error.message);
        this.preferMongoDB = false;
      }
    }

    // المحاولة الثانية: الملف المحلي (fallback)
    try {
      return await this.getRandomHadithFromFile(source);
    } catch (error) {
      console.error('❌ فشل في الحصول على حديث من الملف المحلي:', error.message);
      
      // حديث احتياطي في حالة فشل جميع المحاولات
      return {
        hadithText: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم"',
        book: 'صحيح البخاري',
        englishNarrator: 'أبو هريرة رضي الله عنه',
        hadithNumber: '6406',
        chapter: 'كتاب الدعوات',
        id: 'backup_hadith',
        source: 'صحيح البخاري'
      };
    }
  }

  /**
   * الحصول على حديث عشوائي من MongoDB
   */
  async getRandomHadithFromMongoDB(source = null) {
    try {
      const db = await this.connectToDB();
      if (!db) return null;

      const collection = db.collection('alahadith');
      
      // إعداد فلتر البحث
      let matchStage = {};
      if (source) {
        matchStage.source = { $regex: source, $options: 'i' };
      }

      // استعلام MongoDB للحصول على حديث عشوائي
      const pipeline = [
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
        { $sample: { size: 1 } }
      ];

      const result = await collection.aggregate(pipeline).toArray();
      
      if (result.length === 0) {
        // محاولة الحصول على أي حديث في حالة عدم وجود نتائج للمصدر المحدد
        const fallbackResult = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();
        if (fallbackResult.length === 0) {
          return null;
        }
        const hadith = fallbackResult[0];
        console.log(`📜 تم اختيار حديث عشوائي من MongoDB (fallback)`);
        return this.formatHadith(hadith);
      }

      const hadith = result[0];
      console.log(`📜 تم اختيار حديث من MongoDB - المصدر: ${hadith.source || 'غير محدد'}`);
      return this.formatHadith(hadith);

    } catch (error) {
      console.error('❌ خطأ في الحصول على حديث من MongoDB:', error.message);
      return null;
    }
  }

  /**
   * الحصول على حديث عشوائي من الملف المحلي
   */
  async getRandomHadithFromFile(source = null) {
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

    console.log(`📜 تم اختيار حديث من الملف المحلي - المصدر: ${selectedHadith.source || 'غير محدد'}`);
    return this.formatHadith(selectedHadith);
  }

  /**
   * تنسيق الحديث بالتنسيق المطلوب
   */
  formatHadith(hadith) {
    return {
      hadithText: hadith.hadith || hadith.uhadith || hadith.text || 'النص غير متوفر',
      book: hadith.source || 'غير محدد',
      englishNarrator: hadith.narrator || 'غير محدد',
      hadithNumber: hadith.id?.toString() || hadith._id?.toString() || 'غير محدد',
      chapter: hadith.chapter || 'غير محدد',
      id: hadith._id || hadith.id,
      source: hadith.source || 'غير محدد'
    };
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
   * البحث في الأحاديث من MongoDB أو الملف المحلي
   * @param {string} searchTerm - كلمة البحث
   * @param {string} source - المصدر (اختياري)
   * @returns {Array} قائمة بالأحاديث المطابقة
   */
  async searchHadiths(searchTerm, source = null) {
    // المحاولة الأولى: البحث في MongoDB
    if (this.preferMongoDB) {
      try {
        const results = await this.searchHadithsInMongoDB(searchTerm, source);
        if (results && results.length > 0) {
          return results;
        }
      } catch (error) {
        console.warn('⚠️ فشل البحث في MongoDB:', error.message);
        this.preferMongoDB = false;
      }
    }

    // المحاولة الثانية: البحث في الملف المحلي
    return await this.searchHadithsInFile(searchTerm, source);
  }

  /**
   * البحث في أحاديث MongoDB
   */
  async searchHadithsInMongoDB(searchTerm, source = null) {
    try {
      const db = await this.connectToDB();
      if (!db) return [];

      const collection = db.collection('alahadith');
      
      // إعداد فلتر البحث
      let matchStage = {
        $or: [
          { hadith: { $regex: searchTerm, $options: 'i' } },
          { uhadith: { $regex: searchTerm, $options: 'i' } },
          { text: { $regex: searchTerm, $options: 'i' } }
        ]
      };

      // إضافة فلتر المصدر إذا تم تحديده
      if (source) {
        matchStage.source = { $regex: source, $options: 'i' };
      }

      const results = await collection.find(matchStage).limit(100).toArray();
      console.log(`🔍 تم العثور على ${results.length} حديث في MongoDB يحتوي على: "${searchTerm}"`);
      
      return results;

    } catch (error) {
      console.error('❌ خطأ في البحث في MongoDB:', error.message);
      return [];
    }
  }

  /**
   * البحث في أحاديث الملف المحلي
   */
  async searchHadithsInFile(searchTerm, source = null) {
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

      console.log(`🔍 تم العثور على ${searchResults.length} حديث في الملف المحلي يحتوي على: "${searchTerm}"`);
      return searchResults;

    } catch (error) {
      console.error('❌ خطأ في البحث في الملف المحلي:', error.message);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات البيانات من MongoDB أو الملف المحلي
   * @returns {Object} إحصائيات
   */
  async getDataStats() {
    // المحاولة الأولى: إحصائيات من MongoDB
    if (this.preferMongoDB) {
      try {
        const stats = await this.getDataStatsFromMongoDB();
        if (stats) {
          return stats;
        }
      } catch (error) {
        console.warn('⚠️ فشل في الحصول على إحصائيات من MongoDB:', error.message);
        this.preferMongoDB = false;
      }
    }

    // المحاولة الثانية: إحصائيات من الملف المحلي
    return await this.getDataStatsFromFile();
  }

  /**
   * الحصول على إحصائيات من MongoDB
   */
  async getDataStatsFromMongoDB() {
    try {
      const db = await this.connectToDB();
      if (!db) return null;

      const collection = db.collection('alahadith');
      
      // إجمالي الأحاديث
      const total = await collection.countDocuments();
      
      // عدد أحاديث البخاري
      const bukhariCount = await collection.countDocuments({
        source: { $regex: 'البخاري', $options: 'i' }
      });
      
      // عدد أحاديث مسلم
      const muslimCount = await collection.countDocuments({
        source: { $regex: 'مسلم', $options: 'i' }
      });

      const stats = {
        total,
        bukhari: bukhariCount,
        muslim: muslimCount,
        other: total - bukhariCount - muslimCount,
        dataSource: 'MongoDB Atlas'
      };

      console.log('📊 إحصائيات بيانات الأحاديث من MongoDB:', stats);
      return stats;

    } catch (error) {
      console.error('❌ خطأ في الحصول على إحصائيات من MongoDB:', error.message);
      return null;
    }
  }

  /**
   * الحصول على إحصائيات من الملف المحلي
   */
  async getDataStatsFromFile() {
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
        other: this.hadithData.length - bukhariCount - muslimCount,
        dataSource: 'ملف محلي'
      };

      console.log('📊 إحصائيات بيانات الأحاديث من الملف المحلي:', stats);
      return stats;

    } catch (error) {
      console.error('❌ خطأ في الحصول على إحصائيات من الملف المحلي:', error.message);
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
