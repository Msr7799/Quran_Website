import { getSubscribers } from '../../utils/mongoDataStorage.js';
import { sendDailyHadithToAll } from '../../utils/emailSender.js';
import hadithReader from '../../utils/hadithDataReader.js';

export default async function handler(req, res) {
  // فقط POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      ok: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // الحصول على قائمة المشتركين
    const subscribers = await getSubscribers();
    
    if (subscribers.length === 0) {
      return res.status(200).json({ 
        ok: true, 
        message: 'لا يوجد مشتركين حالياً',
        stats: { total: 0, successful: 0, failed: 0 }
      });
    }

    // جلب حديث عشوائي من الملفات المحلية
    let hadith;
    try {
      
      // اختيار عشوائي بين البخاري ومسلم
      const sources = ['البخاري', 'مسلم'];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      
      // محاولة الحصول على حديث من المصدر المحدد
      hadith = await hadithReader.getRandomHadith(randomSource);

    } catch (localError) {
      console.warn('⚠️ فشل الحصول على حديث من المصدر المحدد:', localError.message);
      try {
        // محاولة الحصول على أي حديث عشوائي (بدون تحديد مصدر)
        hadith = await hadithReader.getRandomHadith();
        
      } catch (fallbackError) {
        console.warn('⚠️ فشل الحصول على أي حديث من المصادر المحلية، استخدام الحديث الاحتياطي:', fallbackError.message);        
        // حديث احتياطي ثابت في حالة فشل جميع المحاولات
        hadith = {
          hadithText: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم"',
          book: 'صحيح البخاري',
          englishNarrator: 'أبو هريرة رضي الله عنه',
          hadithNumber: '6406',
          chapter: 'كتاب الدعوات'
        };
        
      }
    }

    // إرسال الحديث لجميع المشتركين
    const results = await sendDailyHadithToAll(subscribers, hadith);

    const stats = {
      total: subscribers.length,
      successful: results.successful.length,
      failed: results.failed.length
    };

    return res.status(200).json({ 
      ok: true, 
      message: `تم إرسال الحديث اليومي بنجاح إلى ${stats.successful} مشترك${stats.failed > 0 ? ` (فشل: ${stats.failed})` : ''}`,
      stats,
      hadith: {
        text: hadith.hadithText?.substring(0, 150) + '...',
        source: hadith.book,
        narrator: hadith.englishNarrator
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      ok: false, 
      message: 'حدث خطأ أثناء إرسال الحديث اليومي',
      error: error.message
    });
  }
}
