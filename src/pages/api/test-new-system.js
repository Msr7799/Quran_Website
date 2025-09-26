// ملف اختبار النظام الجديد - إرسال حديث لجميع المستخدمين
import { getSubscribers } from '../../utils/mongoDataStorage.js';
import { sendDailyHadithToAll } from '../../utils/emailSender.js';
import hadithReader from '../../utils/hadithDataReader.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    console.log('🧪 بدء اختبار النظام الجديد...');

    // الحصول على المشتركين
    const subscribers = await getSubscribers();
    if (subscribers.length === 0) {
      return res.status(200).json({ 
        ok: true, 
        message: 'لا يوجد مشتركين للاختبار',
        stats: { total: 0, successful: 0, failed: 0 }
      });
    }

    console.log(`👥 عدد المشتركين: ${subscribers.length}`);

    // جلب حديث من البيانات المحلية
    const hadith = await hadithReader.getRandomHadith();
    console.log('✅ تم جلب حديث اختبار من:', hadith.book);

    // إرسال الحديث لجميع المشتركين
    const results = await sendDailyHadithToAll(subscribers, hadith);

    const stats = {
      total: subscribers.length,
      successful: results.successful.length,
      failed: results.failed.length,
      system: 'النظام المحلي الجديد',
      hadithSource: hadith.book
    };

    return res.status(200).json({ 
      ok: true, 
      message: `اختبار النظام الجديد مكتمل - نجح: ${stats.successful}, فشل: ${stats.failed}`,
      stats,
      hadith: {
        text: hadith.hadithText?.substring(0, 100) + '...',
        source: hadith.book
      }
    });

  } catch (error) {
    console.error('❌ خطأ في اختبار النظام:', error);
    return res.status(500).json({ 
      ok: false, 
      message: 'خطأ في اختبار النظام الجديد',
      error: error.message
    });
  }
}
