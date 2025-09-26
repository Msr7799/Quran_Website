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
      
      // إرسال أول حديث بعد 10 ثواني (مدة قصيرة وموثوقة)
      setTimeout(async () => {
        try {
          console.log('🔍 بدء إرسال أول حديث للمشترك الجديد:', cleanEmail);
          
          // استدعاء API للمعالجة
          const response = await fetch(`${process.env.SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-first-hadith`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail })
          });
          
          const result = await response.json();
          if (result.ok) {
            console.log('✅ تم إرسال أول حديث بنجاح للمشترك:', cleanEmail);
          } else {
            console.error('❌ فشل في إرسال أول حديث:', result.message);
          }
        } catch (error) {
          console.error('❌ خطأ في استدعاء إرسال أول حديث:', error.message);
        }
      }, 10 * 1000); // 10 ثوانِ
      
      console.log('📧 اشتراك جديد نجح:', cleanEmail);
      console.log('⏱️ سيتم إرسال أول حديث خلال 10 ثوانِ');
      
      return res.status(200).json({ 
        ok: true, 
        message: 'تم الاشتراك بنجاح! ستصلك رسالة ترحيب فوراً وأول حديث خلال 10 ثوانِ' 
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
