// API endpoint للحصول على إحصائيات قاعدة بيانات الأحاديث

export default async function handler(req, res) {
  // دعم GET requests فقط
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      ok: false, 
    });
  }

  try {
    console.log('📊 طلب إحصائيات قاعدة بيانات الأحاديث...');

    // Dynamic import لتجنب مشاكل build
    const hadithReader = (await import('../../../utils/hadithDataReader.js')).default;
    
    // الحصول على إحصائيات قاعدة البيانات
    const stats = await hadithReader.getDataStats();
      
      // معلومات إضافية
      const additionalInfo = {
        dataSource: 'ملفات محلية - صحيح البخاري ومسلم',
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };

    // حساب النسب المئوية
    const percentages = {
      bukhari: ((stats.bukhari / stats.total) * 100).toFixed(1),
      muslim: ((stats.muslim / stats.total) * 100).toFixed(1),
      other: ((stats.other / stats.total) * 100).toFixed(1)
    };

    const response = {
      ok: true,
      stats: {
        total: stats.total,
        sources: {
          bukhari: {
            count: stats.bukhari,
            percentage: parseFloat(percentages.bukhari),
            name: 'صحيح البخاري'
          },
          muslim: {
            count: stats.muslim,
            percentage: parseFloat(percentages.muslim),
            name: 'صحيح مسلم'
          },
          other: {
            count: stats.other,
            percentage: parseFloat(percentages.other),
            name: 'أخرى'
          }
        }
      },
      metadata: {
        ...additionalInfo,
        api_version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    };

    console.log('✅ تم إرجاع الإحصائيات بنجاح');
    console.log(`📋 إجمالي الأحاديث: ${stats.total}`);
    console.log(`📚 البخاري: ${stats.bukhari} (${percentages.bukhari}%)`);
    console.log(`📖 مسلم: ${stats.muslim} (${percentages.muslim}%)`);

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ خطأ في الحصول على إحصائيات الأحاديث:', error.message);
    
    return res.status(500).json({
      ok: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات',
      error: error.message
    });
  }
}

// إضافة معلومات API للمساعدة
export const config = {
  api: {
    description: 'الحصول على إحصائيات قاعدة بيانات الأحاديث',
    methods: ['GET'],
    parameters: 'لا توجد معاملات مطلوبة',
    response: {
      total: 'إجمالي عدد الأحاديث',
      sources: 'تفصيل حسب المصدر مع النسب المئوية',
      metadata: 'معلومات إضافية حول قاعدة البيانات'
    },
    examples: {
      'GET /api/hadith/stats': 'الحصول على جميع الإحصائيات'
    }
  }
};
