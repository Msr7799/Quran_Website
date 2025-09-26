import axios from 'axios';
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
    console.log('📖 بدء عملية إرسال الحديث اليومي...');

    // الحصول على قائمة المشتركين
    const subscribers = await getSubscribers();
    
    if (subscribers.length === 0) {
      return res.status(200).json({ 
        ok: true, 
        message: 'لا يوجد مشتركين حالياً',
        stats: { total: 0, successful: 0, failed: 0 }
      });
    }

    console.log(`👥 عدد المشتركين: ${subscribers.length}`);

    // جلب حديث عشوائي من الملفات المحلية
    let hadith;
    try {
      console.log('🔍 جلب حديث من الملفات المحلية...');
      
      // اختيار عشوائي بين البخاري ومسلم
      const sources = ['البخاري', 'مسلم'];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      
      // محاولة الحصول على حديث من المصدر المحدد
      hadith = await hadithReader.getRandomHadith(randomSource);
      
      console.log('✅ تم جلب الحديث من:', hadith.book);
      console.log('📄 بداية الحديث:', hadith.hadithText?.substring(0, 100) + '...');

    } catch (localError) {
      console.error('❌ خطأ في جلب الحديث من الملفات المحلية:', localError.message);
      
      try {
        // محاولة الحصول على أي حديث عشوائي (بدون تحديد مصدر)
        console.log('🔄 محاولة الحصول على حديث عشوائي من أي مصدر...');
        hadith = await hadithReader.getRandomHadith();
        console.log('✅ تم جلب حديث عشوائي من:', hadith.book);
        
      } catch (fallbackError) {
        console.error('❌ فشل في جلب الحديث من الملفات المحلية:', fallbackError.message);
        
        // حديث احتياطي ثابت في حالة فشل جميع المحاولات
        hadith = {
          hadithText: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم"',
          book: 'صحيح البخاري',
          englishNarrator: 'أبو هريرة رضي الله عنه',
          hadithNumber: '6406',
          chapter: 'كتاب الدعوات'
        };
        
        console.log('📋 استخدام حديث احتياطي ثابت');
      }
    }

    // إرسال الحديث لجميع المشتركين
    console.log('📧 بدء إرسال الحديث للمشتركين...');
    const results = await sendDailyHadithToAll(subscribers, hadith);

    const stats = {
      total: subscribers.length,
      successful: results.successful.length,
      failed: results.failed.length
    };

    console.log('📊 إحصائيات الإرسال:', stats);

    if (results.failed.length > 0) {
      console.log('❌ فشل الإرسال لـ:', results.failed.map(f => f.email));
    }

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
    console.error('❌ خطأ عام في إرسال الحديث اليومي:', error);
    return res.status(500).json({ 
      ok: false, 
      message: 'حدث خطأ أثناء إرسال الحديث اليومي',
      error: error.message
    });
  }
}
