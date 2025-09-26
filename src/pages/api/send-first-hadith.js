import axios from 'axios';
import { sendDailyHadithToSubscriber } from '../../utils/emailSender.js';
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

    if (!email) {
      return res.status(400).json({ 
        ok: false, 
        message: 'البريد الإلكتروني مطلوب' 
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
      try {
        // محاولة الحصول على أي حديث عشوائي (بدون تحديد مصدر)
        hadith = await hadithReader.getRandomHadith();
        
      } catch (fallbackError) {
        
        // حديث احتياطي ثابت في حالة فشل جميع المحاولات
        hadith = {
          hadithText: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: "مرحباً بك في النشرة اليومية للأحاديث الشريفة. كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم"',
          book: 'صحيح البخاري',
          englishNarrator: 'أبو هريرة رضي الله عنه',
          hadithNumber: '6406',
          chapter: 'كتاب الدعوات'
        };
        
      }
    }

    // إرسال الحديث للمشترك الجديد
    const result = await sendDailyHadithToSubscriber(email, hadith);

    if (result.success) {
      return res.status(200).json({ 
        ok: true, 
        message: `تم إرسال الحديث الأول بنجاح إلى ${email}`,
        hadith: {
          text: hadith.hadithText?.substring(0, 150) + '...',
          source: hadith.book,
          narrator: hadith.englishNarrator
        }
      });
    } else {
      throw new Error(result.error || 'فشل في إرسال الحديث');
    }

  } catch (error) {
    return res.status(500).json({ 
      ok: false, 
      message: 'حدث خطأ أثناء إرسال الحديث الأول',
      error: error.message
    });
  }
}
