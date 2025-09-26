import validator from 'validator';
import { addSubscriber, checkSubscriptionStatus } from '../../utils/mongoDataStorage.js';
import { sendWelcomeEmail } from '../../utils/emailSender.js';

export default async function handler(req, res) {
  // فقط POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      ok: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { email } = req.body;

    // التحقق من وجود الإيميل
    if (!email) {
      return res.status(400).json({ 
        ok: false, 
        message: 'يرجى إدخال بريد إلكتروني' 
      });
    }

    // التحقق من صحة الإيميل
    if (!validator.isEmail(email.trim())) {
      return res.status(400).json({ 
        ok: false, 
        message: 'يرجى إدخال بريد إلكتروني صحيح' 
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // التحقق من حالة الاشتراك الحالية
    const subscriptionStatus = await checkSubscriptionStatus(cleanEmail);
    
    if (subscriptionStatus.exists && subscriptionStatus.isActive) {
      return res.status(409).json({ 
        ok: false, 
        message: 'هذا البريد الإلكتروني مشترك بالفعل',
        exists: true,
        email: cleanEmail,
        action: 'already_subscribed'
      });
    }

    // إضافة المشترك لقاعدة البيانات المحلية
    try {
      await addSubscriber(cleanEmail);
    } catch (error) {
      if (error.message.includes('مشترك بالفعل')) {
        return res.status(409).json({ 
          ok: false, 
          message: 'هذا البريد الإلكتروني مشترك بالفعل',
          exists: true,
          email: cleanEmail,
          action: 'already_subscribed'
        });
      }
      throw error;
    }

    // إرسال رسالة الترحيب
    try {
      await sendWelcomeEmail(cleanEmail);
      console.log('✅ تم إرسال رسالة الترحيب بنجاح');
      
      // إرسال أول حديث مباشرة (بدون setTimeout لتجنب مشاكل Vercel)
      try {
        console.log('🔍 بدء إرسال أول حديث للمشترك الجديد:', cleanEmail);
        
        // استيراد الدوال مباشرة بدلاً من fetch
        const hadithReader = (await import('../../utils/hadithDataReader.js')).default;
        const { sendDailyHadithToSubscriber } = await import('../../utils/emailSender.js');
        const { markFirstHadithSent } = await import('../../utils/mongoDataStorage.js');
        
        // جلب حديث عشوائي
        const sources = ['البخاري', 'مسلم'];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        let hadith;
        
        try {
          hadith = await hadithReader.getRandomHadith(randomSource);
        } catch {
          hadith = {
            hadithText: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم',
            book: 'صحيح البخاري',
            englishNarrator: 'أبو هريرة رضي الله عنه'
          };
        }
        
        // إرسال الحديث
        const result = await sendDailyHadithToSubscriber(cleanEmail, hadith);
        
        if (result.success) {
          await markFirstHadithSent(cleanEmail);
          console.log('✅ تم إرسال أول حديث بنجاح للمشترك:', cleanEmail);
          console.log('📖 المصدر:', hadith.book);
        } else {
          console.error('❌ فشل في إرسال أول حديث:', result.error);
        }
        
      } catch (firstHadithError) {
        console.error('❌ خطأ في إرسال أول حديث:', firstHadithError.message);
        // لا نوقف العملية - المشترك مضاف ورسالة الترحيب أرسلت
      }
      
      console.log('📧 اشتراك جديد نجح:', cleanEmail);
      console.log('📖 تم إرسال رسالة الترحيب وأول حديث');
      
      return res.status(200).json({ 
        ok: true, 
        message: 'تم الاشتراك بنجاح! ستصلك رسالة ترحيب وأول حديث فوراً' 
      });
    } catch (emailError) {
      console.error('❌ خطأ في إرسال رسالة الترحيب:', emailError);
      
      // نحاول حذف المشترك إذا فشل الإيميل
      try {
        const { removeSubscriber } = await import('../../utils/mongoDataStorage.js');
        await removeSubscriber(cleanEmail);
      } catch (removeError) {
        console.error('❌ خطأ في حذف المشترك بعد فشل الإيميل:', removeError);
      }
      
      return res.status(500).json({ 
        ok: false, 
        message: 'تم الاشتراك ولكن فشل إرسال رسالة الترحيب. تأكد من إعدادات البريد الإلكتروني.' 
      });
    }

  } catch (error) {
    console.error('❌ خطأ في الاشتراك:', error);
    return res.status(500).json({ 
      ok: false, 
      message: 'حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى لاحقاً.' 
    });
  }
}
