import axios from 'axios';
import { sendDailyHadithToSubscriber } from '../../utils/emailSender.js';

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

    console.log('📖 بدء إرسال الحديث الأول للمشترك الجديد:', email);

    // جلب حديث عشوائي من API الأحاديث
    let hadith;
    try {
      console.log('🔍 جلب حديث من API...');
      
      // اختيار عشوائي بين البخاري ومسلم
      const books = ['bukhari', 'muslim'];
      const randomBook = books[Math.floor(Math.random() * books.length)];
      
      const hadithResponse = await axios.get(`https://hadithapi.com/api/hadiths/?apiKey=${process.env.HADITH_API_KEY}&book=${randomBook}&paginate=10`, {
        timeout: 10000 // 10 seconds timeout
      });

      console.log('📡 Hadith API Response Status:', hadithResponse.status);
      console.log('📄 Hadith API Response Data Keys:', Object.keys(hadithResponse.data || {}));

      if (!hadithResponse.data || !hadithResponse.data.hadiths || hadithResponse.data.hadiths.length === 0) {
        throw new Error('لم يتم العثور على أحاديث من API');
      }

      // اختيار حديث عشوائي من النتائج
      const randomIndex = Math.floor(Math.random() * hadithResponse.data.hadiths.length);
      hadith = hadithResponse.data.hadiths[randomIndex];
      console.log('✅ تم جلب الحديث من:', randomBook);
      console.log('📄 بداية الحديث:', hadith.hadithText?.substring(0, 100) + '...');

    } catch (apiError) {
      console.error('❌ خطأ في جلب الحديث من API:', apiError.message);
      
      // حديث احتياطي في حالة فشل API
      hadith = {
        hadithText: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: "مرحباً بك في النشرة اليومية للأحاديث الشريفة. كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم"',
        book: 'صحيح البخاري',
        englishNarrator: 'أبو هريرة رضي الله عنه',
        hadithNumber: '6406',
        chapter: 'كتاب الدعوات'
      };
      
      console.log('📋 استخدام حديث احتياطي');
    }

    // إرسال الحديث للمشترك الجديد
    console.log('📧 إرسال الحديث الأول للمشترك...');
    const result = await sendDailyHadithToSubscriber(email, hadith);

    if (result.success) {
      console.log('✅ تم إرسال الحديث الأول بنجاح إلى:', email);
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
    console.error('❌ خطأ في إرسال الحديث الأول:', error);
    return res.status(500).json({ 
      ok: false, 
      message: 'حدث خطأ أثناء إرسال الحديث الأول',
      error: error.message
    });
  }
}
