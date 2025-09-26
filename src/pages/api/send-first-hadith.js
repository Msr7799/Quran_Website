import { sendDailyHadithToSubscriber } from '../../utils/emailSender.js';
import { getPendingFirstHadithSubscribers, markFirstHadithSent } from '../../utils/mongoDataStorage.js';
import hadithReader from '../../utils/hadithDataReader.js';

export default async function handler(req, res) {
  // دعم GET و POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      ok: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('🔍 البحث عن المشتركين المعلقين (أكثر من 5 ثواني)...');
    
    // البحث عن المشتركين الذين لم يتلقوا أول حديث
    const pendingEmails = await getPendingFirstHadithSubscribers(5);
    
    if (pendingEmails.length === 0) {
      return res.status(200).json({ 
        ok: true, 
        message: 'لا يوجد مشتركين معلقين حالياً',
        processed: 0
      });
    }

    console.log(`📋 تم العثور على ${pendingEmails.length} مشترك معلق`);
    
    let successCount = 0;
    let failureCount = 0;


    // جلب حديث واحد للجميع
    let hadith;
    try {
      const sources = ['البخاري', 'مسلم'];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      hadith = await hadithReader.getRandomHadith(randomSource);
    } catch (error) {
      hadith = {
        hadithText: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم',
        book: 'صحيح البخاري',
        englishNarrator: 'أبو هريرة رضي الله عنه'
      };
    }

    // إرسال لجميع المشتركين المعلقين
    for (const email of pendingEmails) {
      try {
        const result = await sendDailyHadithToSubscriber(email, hadith);
        
        if (result.success) {
          await markFirstHadithSent(email);
          successCount++;
          console.log(`✅ تم إرسال أول حديث لـ: ${email}`);
        } else {
          failureCount++;
          console.error(`❌ فشل إرسال لـ: ${email}`);
        }
      } catch (emailError) {
        failureCount++;
        console.error(`❌ خطأ في إرسال لـ: ${email}`, emailError.message);
      }
    }

    return res.status(200).json({ 
      ok: true, 
      message: `تمت معالجة ${pendingEmails.length} مشترك`,
      processed: pendingEmails.length,
      success: successCount,
      failures: failureCount,
      hadith: {
        source: hadith.book,
        preview: hadith.hadithText?.substring(0, 100) + '...'
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      ok: false, 
      message: 'حدث خطأ في معالجة المشتركين المعلقين',
      error: error.message
    });
  }
}
