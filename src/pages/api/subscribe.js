import validator from 'validator';
import { addSubscriber, checkSubscriptionStatus } from '../../utils/mongoDataStorage.js';
import { sendWelcomeEmail } from '../../utils/emailSender.js';
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
      
      // جدولة إرسال الحديث الأول بعد 3 دقائق (للتجنب التعارض مع رسالة الترحيب)
      setTimeout(async () => {
        try {
          console.log('🔍 وقت إرسال الحديث الأول - جلب من الملفات المحلية...');
          
          // اختيار عشوائي بين البخاري ومسلم
          const sources = ['البخاري', 'مسلم'];
          const randomSource = sources[Math.floor(Math.random() * sources.length)];
          
          // الحصول على حديث من المصدر المحدد
          const hadith = await hadithReader.getRandomHadith(randomSource);
          
          if (hadith) {
            // إرسال الحديث الأول
            const { sendDailyHadithToSubscriber } = await import('../../utils/emailSender.js');
            const result = await sendDailyHadithToSubscriber(cleanEmail, hadith);
            
            if (result.success) {
              console.log('✅ تم إرسال الحديث الأول بنجاح بعد 3 دقائق للمشترك:', cleanEmail);
              console.log('📄 المصدر:', hadith.book);
            } else {
              console.error('❌ فشل في إرسال الحديث الأول:', result.error);
            }
          }
        } catch (hadithError) {
          console.error('❌ خطأ في إرسال الحديث الأول المُجدول:', hadithError);
        }
      }, 3 * 60 * 1000); // 3 دقائق = 180000 مللي ثانية
      
      console.log('📧 اشتراك جديد نجح:', cleanEmail);
      
      return res.status(200).json({ 
        ok: true, 
        message: 'تم الاشتراك بنجاح! ستصلك رسالة ترحيب فوراً وأول حديث خلال 3 دقائق' 
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
