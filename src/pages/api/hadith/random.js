// API endpoint للحصول على حديث عشوائي
// يدعم فلترة حسب المصدر (البخاري/مسلم)

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
    const { source, format } = req.method === 'GET' ? req.query : req.body;
    
    console.log('🔍 طلب حديث عشوائي - المصدر:', source || 'الكل');

    // الحصول على حديث عشوائي
    const hadith = await hadithReader.getRandomHadith(source);
    
    if (!hadith) {
      return res.status(404).json({
        ok: false,
        message: 'لم يتم العثور على أحاديث'
      });
    }

    // تحديد تنسيق الاستجابة
    let response;
    
    if (format === 'simple') {
      // تنسيق مبسط
      response = {
        ok: true,
        hadith: {
          text: hadith.hadithText,
          source: hadith.book,
          id: hadith.id
        }
      };
    } else {
      // تنسيق كامل (افتراضي)
      response = {
        ok: true,
        hadith: {
          text: hadith.hadithText,
          source: hadith.book,
          book: hadith.book,
          narrator: hadith.englishNarrator,
          number: hadith.hadithNumber,
          chapter: hadith.chapter,
          id: hadith.id
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source_filter: source || 'الكل',
          total_length: hadith.hadithText?.length || 0
        }
      };
    }

    console.log('✅ تم إرجاع حديث من:', hadith.book);
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ خطأ في API الحديث العشوائي:', error.message);
    
    return res.status(500).json({
      ok: false,
      message: 'حدث خطأ أثناء جلب الحديث',
      error: error.message
    });
  }
}

// إضافة معلومات API للمساعدة
export const config = {
  api: {
    description: 'الحصول على حديث عشوائي من صحيح البخاري ومسلم',
    methods: ['GET', 'POST'],
    parameters: {
      source: 'المصدر المطلوب (البخاري/مسلم) - اختياري',
      format: 'تنسيق الاستجابة (simple/full) - افتراضي: full'
    },
    examples: {
      'GET /api/hadith/random': 'حديث عشوائي من أي مصدر',
      'GET /api/hadith/random?source=البخاري': 'حديث عشوائي من البخاري',
      'GET /api/hadith/random?source=مسلم&format=simple': 'حديث عشوائي من مسلم بتنسيق مبسط'
    }
  }
};
