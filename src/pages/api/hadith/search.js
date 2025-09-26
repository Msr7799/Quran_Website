// API endpoint للبحث في الأحاديث
// يدعم البحث بالكلمات المفتاحية والفلترة حسب المصدر

import hadithReader from '../../../utils/hadithDataReader.js';

export default async function handler(req, res) {
  // دعم GET و POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      ok: false, 
      message: 'Method not allowed. Use GET or POST.' 
    });
  }

  try {
    // الحصول على المعاملات من الطلب
    const { q, query, source, limit, format } = req.method === 'GET' ? req.query : req.body;
    
    // كلمة البحث (يمكن استخدام q أو query)
    const searchTerm = q || query;
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'يجب تحديد كلمة البحث باستخدام معامل q أو query'
      });
    }

    // تحديد حد النتائج (افتراضي: 50)
    const resultLimit = parseInt(limit) || 50;
    
    console.log(`🔍 البحث عن: "${searchTerm}" في المصدر: ${source || 'الكل'}`);

    // البحث في الأحاديث
    let searchResults = await hadithReader.searchHadiths(searchTerm.trim(), source);
    
    // تطبيق حد النتائج
    if (searchResults.length > resultLimit) {
      searchResults = searchResults.slice(0, resultLimit);
    }

    if (searchResults.length === 0) {
      return res.status(404).json({
        ok: false,
        message: `لم يتم العثور على أحاديث تحتوي على "${searchTerm}"`,
        count: 0
      });
    }

    // تحديد تنسيق الاستجابة
    let response;
    
    if (format === 'simple') {
      // تنسيق مبسط
      response = {
        ok: true,
        count: searchResults.length,
        results: searchResults.map(hadith => ({
          id: hadith.id,
          text: hadith.hadith || hadith.uhadith,
          source: hadith.source
        }))
      };
    } else {
      // تنسيق كامل (افتراضي)
      response = {
        ok: true,
        count: searchResults.length,
        query: searchTerm,
        source_filter: source || 'الكل',
        results: searchResults.map(hadith => ({
          id: hadith.id,
          text: hadith.hadith || hadith.uhadith,
          text_plain: hadith.uhadith || hadith.hadith,
          source: hadith.source,
          // تمييز كلمة البحث في النص
          highlight: highlightSearchTerm(hadith.hadith || hadith.uhadith, searchTerm)
        })),
        metadata: {
          timestamp: new Date().toISOString(),
          search_term: searchTerm,
          source_filter: source || 'الكل',
          limit: resultLimit,
          total_found: searchResults.length
        }
      };
    }

    console.log(`✅ تم العثور على ${searchResults.length} حديث`);
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ خطأ في البحث في الأحاديث:', error.message);
    
    return res.status(500).json({
      ok: false,
      message: 'حدث خطأ أثناء البحث في الأحاديث',
      error: error.message
    });
  }
}

/**
 * تمييز كلمة البحث في النص
 * @param {string} text - النص الأصلي
 * @param {string} searchTerm - كلمة البحث
 * @returns {string} النص مع تمييز كلمة البحث
 */
function highlightSearchTerm(text, searchTerm) {
  if (!text || !searchTerm) return text;
  
  try {
    // استخدام regex بسيط لتمييز كلمة البحث
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '**$1**');
  } catch (error) {
    // في حالة خطأ في regex، إرجاع النص الأصلي
    return text;
  }
}

// إضافة معلومات API للمساعدة
export const config = {
  api: {
    description: 'البحث في أحاديث صحيح البخاري ومسلم',
    methods: ['GET', 'POST'],
    parameters: {
      q: 'كلمة البحث (مطلوب)',
      query: 'كلمة البحث (بديل لـ q)',
      source: 'المصدر المطلوب (البخاري/مسلم) - اختياري',
      limit: 'عدد النتائج المطلوب (افتراضي: 50)',
      format: 'تنسيق الاستجابة (simple/full) - افتراضي: full'
    },
    examples: {
      'GET /api/hadith/search?q=الصلاة': 'البحث عن "الصلاة" في جميع الأحاديث',
      'GET /api/hadith/search?q=الزكاة&source=البخاري': 'البحث عن "الزكاة" في البخاري فقط',
      'POST /api/hadith/search': 'البحث باستخدام JSON body'
    }
  }
};
