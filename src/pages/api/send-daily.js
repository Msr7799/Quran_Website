import axios from 'axios';
import { getSubscribers } from '../../utils/dataStorage.js';
import { sendDailyHadithToAll } from '../../utils/emailSender.js';

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

    // جلب حديث عشوائي من API الأحاديث
    let hadith;
    try {
      console.log('🔍 جلب حديث من API...');
      
      // اختيار عشوائي بين البخاري ومسلم
      const books = ['bukhari', 'muslim'];
      const randomBook = books[Math.floor(Math.random() * books.length)];
      
      const hadithResponse = await axios.get('https://hadithapi.com/public/api/hadiths', {
        params: {
          apiKey: process.env.HADITH_API_KEY,
          book: randomBook,
          random: 1
        },
        timeout: 10000 // 10 seconds timeout
      });

      if (!hadithResponse.data || !hadithResponse.data.hadiths || hadithResponse.data.hadiths.length === 0) {
        throw new Error('لم يتم العثور على أحاديث من API');
      }

      hadith = hadithResponse.data.hadiths[0];
      console.log('✅ تم جلب الحديث من:', randomBook);
      console.log('📄 بداية الحديث:', hadith.hadithText?.substring(0, 100) + '...');

    } catch (apiError) {
      console.error('❌ خطأ في جلب الحديث من API:', apiError.message);
      
      // حديث احتياطي في حالة فشل API
      hadith = {
        hadithText: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم"',
        book: 'صحيح البخاري',
        englishNarrator: 'أبو هريرة رضي الله عنه',
        hadithNumber: '6406',
        chapter: 'كتاب الدعوات'
      };
      
      console.log('📋 استخدام حديث احتياطي');
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
