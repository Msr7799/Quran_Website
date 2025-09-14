import { verifyUnsubscribeToken } from '../../utils/encryption.js';
import { removeSubscriber } from '../../utils/mongoDataStorage.js';

export default async function handler(req, res) {
  // فقط GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      ok: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <html dir="rtl">
          <body style="font-family: Tahoma, Arial; text-align: center; padding: 50px; background: #ffebee;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #d32f2f;">❌ خطأ</h2>
              <p>رابط إلغاء الاشتراك غير صحيح</p>
              <p style="font-size: 14px; color: #666;">يرجى استخدام الرابط الصحيح من الإيميل المرسل إليك</p>
            </div>
          </body>
        </html>
      `);
    }

    // التحقق من صحة المفتاح
    const email = verifyUnsubscribeToken(token);
    
    if (!email) {
      return res.status(400).send(`
        <html dir="rtl">
          <body style="font-family: Tahoma, Arial; text-align: center; padding: 50px; background: #ffebee;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #d32f2f;">❌ رابط منتهي الصلاحية</h2>
              <p>هذا الرابط منتهي الصلاحية أو غير صحيح</p>
              <p style="font-size: 14px; color: #666;">الرجاء استخدام رابط حديث من آخر إيميل وصلك</p>
            </div>
          </body>
        </html>
      `);
    }

    // حذف المشترك
    try {
      await removeSubscriber(email);
      console.log('🗑️ تم إلغاء اشتراك:', email);
      
      res.status(200).send(`
        <html dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>تم إلغاء الاشتراك - موقع القرآن الكريم</title>
          </head>
          <body style="font-family: Tahoma, Arial; text-align: center; padding: 50px; background: linear-gradient(135deg, #e8f5e8, #f1f8e9);">
            <div style="background: white; padding: 40px; border-radius: 15px; max-width: 600px; margin: 0 auto; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border-top: 5px solid #4caf50;">
              <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
              <h1 style="color: #2e7d32; margin-bottom: 20px;">تم إلغاء الاشتراك بنجاح</h1>
              <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                تم إلغاء اشتراكك في نشرة الأحاديث اليومية من موقع القرآن الكريم
              </p>
              <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="color: #6a1b9a; margin: 0;">
                  <strong>نأسف لرؤيتك تغادر</strong><br>
                  نتمنى أن تعود إلينا قريباً لمواصلة رحلتك مع السنة النبوية المباركة
                </p>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                <p style="font-size: 14px; color: #666;">
                  🕌 <strong>موقع القرآن الكريم</strong><br>
                  نشر القرآن والسنة بأجمل صورة
                </p>
                <p style="font-size: 12px; color: #999; margin-top: 15px;">
                  مطور الموقع: محمد الرميحي | CODE4EVER11@GMAIL.COM
                </p>
              </div>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('❌ خطأ في حذف المشترك:', error);
      
      res.status(500).send(`
        <html dir="rtl">
          <body style="font-family: Tahoma, Arial; text-align: center; padding: 50px; background: #ffebee;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #d32f2f;">❌ خطأ في الخادم</h2>
              <p>حدث خطأ أثناء إلغاء الاشتراك</p>
              <p style="font-size: 14px; color: #666;">يرجى المحاولة مرة أخرى لاحقاً أو التواصل معنا</p>
            </div>
          </body>
        </html>
      `);
    }

  } catch (error) {
    console.error('❌ خطأ عام في إلغاء الاشتراك:', error);
    
    res.status(500).send(`
      <html dir="rtl">
        <body style="font-family: Tahoma, Arial; text-align: center; padding: 50px; background: #ffebee;">
          <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #d32f2f;">❌ خطأ</h2>
            <p>حدث خطأ غير متوقع</p>
            <p style="font-size: 14px; color: #666;">يرجى المحاولة مرة أخرى لاحقاً</p>
          </div>
        </body>
      </html>
    `);
  }
}
