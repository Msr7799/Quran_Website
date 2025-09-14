import validator from 'validator';
import { addSubscriber } from '../../utils/mongoDataStorage.js';
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
      
      // إرسال الحديث الأول فوراً (حل لمشكلة setTimeout في serverless)
      try {
        const axios = require('axios');
        
        // جلب حديث عشوائي
        const books = ['bukhari', 'muslim'];
        const randomBook = books[Math.floor(Math.random() * books.length)];
        
        const hadithResponse = await axios.get('https://hadithapi.com/api/hadiths', {
          params: {
            apiKey: process.env.HADITH_API_KEY,
            book: randomBook,
            random: 1
          },
          timeout: 10000
        });

        if (hadithResponse.data && hadithResponse.data.hadiths && hadithResponse.data.hadiths.length > 0) {
          const hadith = hadithResponse.data.hadiths[0];
          
          // إرسال الحديث الأول
          const { sendDailyHadithToSubscriber } = await import('../../utils/emailSender.js');
          const result = await sendDailyHadithToSubscriber(cleanEmail, hadith);
          
          if (result.success) {
            console.log('✅ تم إرسال الحديث الأول بنجاح للمشترك:', cleanEmail);
          } else {
            console.error('❌ فشل في إرسال الحديث الأول:', result.error);
          }
        }
      } catch (hadithError) {
        console.error('❌ خطأ في إرسال الحديث الأول:', hadithError);
        // لا نوقف العملية في حال فشل الحديث
      }
      
      console.log('📧 اشتراك جديد نجح:', cleanEmail);
      
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
