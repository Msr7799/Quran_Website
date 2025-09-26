// API endpoint لتشخيص مشاكل نظام الأحاديث
import { getSubscribers } from '../../utils/mongoDataStorage.js';
import hadithReader from '../../utils/hadithDataReader.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      ok: false, 
      message: 'Method not allowed - use GET' 
    });
  }

  const debug = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  try {
    // 1. فحص MongoDB
    console.log('🔍 فحص MongoDB...');
    try {
      const subscribers = await getSubscribers();
      debug.checks.mongodb = {
        status: 'success',
        subscribersCount: subscribers.length,
        message: `تم العثور على ${subscribers.length} مشترك`
      };
    } catch (mongoError) {
      debug.checks.mongodb = {
        status: 'error',
        error: mongoError.message,
        message: 'فشل الاتصال بـ MongoDB'
      };
    }

    // 2. فحص ملف الأحاديث
    console.log('🔍 فحص ملف الأحاديث...');
    try {
      const hadith = await hadithReader.getRandomHadith();
      debug.checks.hadithFile = {
        status: 'success',
        hadithSample: {
          text: hadith.hadithText?.substring(0, 100) + '...',
          source: hadith.book,
          narrator: hadith.englishNarrator
        },
        message: 'تم جلب حديث عشوائي بنجاح'
      };
    } catch (hadithError) {
      debug.checks.hadithFile = {
        status: 'error',
        error: hadithError.message,
        message: 'فشل في قراءة ملف الأحاديث'
      };
    }

    // 3. فحص متغيرات البيئة
    console.log('🔍 فحص متغيرات البيئة...');
    debug.checks.environment = {
      status: 'info',
      variables: {
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        MONGODB_URI: process.env.MONGODB_URI ? 'configured' : 'missing',
        GMAIL_USER: process.env.GMAIL_USER ? 'configured' : 'missing',
        GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'configured' : 'missing',
        EMAIL_FROM: process.env.EMAIL_FROM || 'undefined'
      },
      message: 'فحص متغيرات البيئة'
    };

    // 4. فحص مسار الملف
    console.log('🔍 فحص مسار ملف الأحاديث...');
    const dataStats = await hadithReader.getDataStats();
    debug.checks.dataStats = {
      status: 'success',
      stats: dataStats,
      message: 'إحصائيات ملف الأحاديث'
    };

    return res.status(200).json({
      ok: true,
      message: 'تم فحص جميع المكونات',
      debug
    });

  } catch (error) {
    console.error('❌ خطأ عام في التشخيص:', error);
    
    debug.checks.general = {
      status: 'error',
      error: error.message,
      stack: error.stack
    };

    return res.status(500).json({
      ok: false,
      message: 'فشل التشخيص',
      debug
    });
  }
}
