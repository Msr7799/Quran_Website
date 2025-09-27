// API endpoint للإرسال اليومي الذكي - بدون Cron Jobs
// يعمل عند الاستدعاء ويفحص MongoDB إذا تم الإرسال اليوم أم لا

import { getSubscribers, checkTodayHadithSent, markTodayHadithSent } from '../../../utils/mongoDataStorage.js';
import { sendDailyHadithToAll } from '../../../utils/emailSender.js';

export default async function handler(req, res) {
  // دعم GET و POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      ok: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('🔍 فحص نظام الإرسال اليومي الذكي...');

    // فحص هل تم الإرسال اليوم من MongoDB
    const alreadySentToday = await checkTodayHadithSent();
    
    if (alreadySentToday) {
      console.log('✅ تم إرسال الحديث اليومي بالفعل اليوم');
      return res.status(200).json({ 
        ok: true, 
        message: 'تم إرسال الحديث اليومي بالفعل اليوم',
        alreadySent: true,
        date: new Date().toDateString()
      });
    }

    console.log('🚀 لم يتم الإرسال اليوم - بدء الإرسال...');

    // الحصول على قائمة المشتركين
    const subscribers = await getSubscribers();
    
    if (subscribers.length === 0) {
      console.log('👥 لا يوجد مشتركين حالياً');
      return res.status(200).json({ 
        ok: true, 
        message: 'لا يوجد مشتركين حالياً',
        stats: { total: 0, successful: 0, failed: 0 }
      });
    }

    console.log(`👥 عدد المشتركين: ${subscribers.length}`);

    // جلب حديث عشوائي عبر dynamic import
    let hadith;
    try {
      console.log('🔍 جلب حديث من الملفات المحلية...');
      
      // Dynamic import لتجنب مشاكل build
      const hadithReader = (await import('../../../utils/hadithDataReader.js')).default;
      
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
    console.log('📤 بدء إرسال الحديث اليومي للمشتركين...');
    
    const result = await sendDailyHadithToAll(hadith);
    
    if (result.success) {
      // تسجيل الإرسال في MongoDB لتجنب التكرار
      const hadithData = {
        book: hadith.book,
        text: hadith.hadithText?.substring(0, 200),
        subscribersCount: result.totalSent
      };
      
      await markTodayHadithSent(hadithData);
      
      console.log(`✅ تم إرسال الحديث اليومي بنجاح إلى ${result.totalSent} مشترك`);
      console.log(`❌ فشل الإرسال لـ ${result.totalFailed} مشترك`);
      console.log('💾 تم تسجيل الإرسال في MongoDB');
      
      return res.status(200).json({ 
        ok: true, 
        message: 'تم إرسال الحديث اليومي بنجاح وتسجيله في قاعدة البيانات',
        stats: {
          total: subscribers.length,
          successful: result.totalSent,
          failed: result.totalFailed
        },
        hadith: {
          source: hadith.book,
          preview: hadith.hadithText?.substring(0, 150) + '...'
        },
        date: new Date().toDateString()
      });
    } else {
      throw new Error('فشل في إرسال الحديث اليومي');
    }

  } catch (error) {
    console.error('❌ خطأ في الإرسال اليومي الذكي:', error);
    
    return res.status(500).json({ 
      ok: false, 
      message: 'حدث خطأ أثناء الإرسال اليومي الذكي',
      error: error.message
    });
  }
}
