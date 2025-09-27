import { sendDailyHadithToSubscriber } from '../../utils/emailSender.js';
import { getPendingFirstHadithSubscribers, markFirstHadithSent } from '../../utils/mongoDataStorage.js';

export default async function handler(req, res) {
  // دعم GET و POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      ok: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // دعم GET و POST - فحص query parameters و body
    const singleEmail = req.method === 'GET' 
      ? req.query.email 
      : req.body?.email;
    
    let pendingEmails = [];
    
    if (singleEmail) {
      // طلب لإيميل محدد
      console.log('🔍 معالجة طلب أول حديث لإيميل محدد:', singleEmail);
      
      // فحص أن الإيميل لم يتلق أول حديث مسبقاً
      const { checkSubscriptionStatus } = await import('../../utils/mongoDataStorage.js');
      const status = await checkSubscriptionStatus(singleEmail);
      
      if (!status.exists || !status.isActive) {
        return res.status(400).json({ 
          ok: false, 
          message: `الإيميل ${singleEmail} غير مشترك أو غير نشط`,
          processed: 0
        });
      }
      
      pendingEmails = [singleEmail];
    } else {
      // البحث عن المشتركين المعلقين (أكثر من 5 ثواني)
      console.log('🔍 البحث عن المشتركين المعلقين (أكثر من 5 ثواني)...');
      pendingEmails = await getPendingFirstHadithSubscribers(5);
    }
    
    if (pendingEmails.length === 0) {
      return res.status(200).json({ 
        ok: true, 
        message: singleEmail ? `لا حاجة لإرسال أول حديث للإيميل: ${singleEmail}` : 'لا يوجد مشتركين معلقين حالياً',
        processed: 0
      });
    }

    console.log(`📋 سيتم معالجة ${pendingEmails.length} مشترك`);
    
    let successCount = 0;
    let failureCount = 0;


    // جلب حديث واحد للجميع
    let hadith;
    try {
      // Dynamic import لتجنب مشاكل build
      const hadithReader = (await import('../../utils/hadithDataReader.js')).default;
      
      const sources = ['البخاري', 'مسلم'];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      hadith = await hadithReader.getRandomHadith(randomSource);
    } catch {
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
