import crypto from 'crypto';

// التحقق من صحة وانتهاء صلاحية الـ Token
function verifyUnsubscribeToken(token) {
  try {
    const [encodedData, receivedHash] = token.split('.');
    const data = Buffer.from(encodedData, 'base64').toString();
    const [email, timestamp] = data.split(':');
    
    // التحقق من انتهاء الصلاحية (24 ساعة)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 ساعة
    
    if (tokenAge > maxAge) {
      return { valid: false, error: 'انتهت صلاحية الرابط' };
    }
    
    // التحقق من صحة الـ hash
    const expectedHash = crypto.createHash('sha256').update(data + process.env.UNSUBSCRIBE_SECRET).digest('hex');
    
    if (receivedHash !== expectedHash) {
      return { valid: false, error: 'رابط غير صالح' };
    }
    
    return { valid: true, email };
  } catch {
    return { valid: false, error: 'رابط غير صالح' };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>خطأ - رابط غير صالح</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
            .home-link { color: #007bff; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌ رابط غير صالح</div>
            <p>الرابط المستخدم غير صالح أو مفقود.</p>
            <a href="/" class="home-link">العودة إلى الموقع الرئيسي</a>
          </div>
        </body>
        </html>
      `);
    }

    // التحقق من صحة الـ Token
    const tokenResult = verifyUnsubscribeToken(token);
    
    if (!tokenResult.valid) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>خطأ - ${tokenResult.error}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
            .home-link { color: #007bff; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌ ${tokenResult.error}</div>
            <p>يرجى طلب رابط جديد من الموقع الرئيسي.</p>
            <a href="/" class="home-link">العودة إلى الموقع الرئيسي</a>
          </div>
        </body>
        </html>
      `);
    }

    // الاتصال بقاعدة البيانات عبر dynamic import
    const { connectToDatabase } = await import('../../utils/mongoDataStorage.js');
    const { db } = await connectToDatabase();
    
    // البحث عن المشترك
    const subscriber = await db.collection('subscribers').findOne({
      email: tokenResult.email
    });

    if (!subscriber) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>البريد الإلكتروني غير موجود</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .info { color: #17a2b8; font-size: 24px; margin-bottom: 20px; }
            .home-link { color: #007bff; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="info">ℹ️ البريد الإلكتروني غير مشترك</div>
            <p>هذا البريد الإلكتروني غير مشترك في النشرة البريدية.</p>
            <a href="/" class="home-link">العودة إلى الموقع الرئيسي</a>
          </div>
        </body>
        </html>
      `);
    }

    // تعطيل المشترك بدلاً من حذفه نهائياً
    const updateResult = await db.collection('subscribers').updateOne(
      { email: tokenResult.email },
      { 
        $set: { 
          isActive: false, 
          unsubscribedAt: new Date() 
        } 
      }
    );

    if (updateResult.matchedCount === 1) {
      // إلغاء اشتراك ناجح
      return res.status(200).send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>تم إلغاء الاشتراك بنجاح</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              max-width: 600px; 
              background: white; 
              padding: 40px; 
              border-radius: 15px; 
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            .success { 
              color: #28a745; 
              font-size: 28px; 
              margin-bottom: 20px; 
              font-weight: bold;
            }
            .email { 
              background: #f8f9fa; 
              padding: 10px; 
              border-radius: 5px; 
              margin: 20px 0; 
              font-family: monospace;
              color: #495057;
            }
            .message { 
              font-size: 18px; 
              line-height: 1.6; 
              margin-bottom: 30px;
              color: #333;
            }
            .home-link { 
              background: #007bff; 
              color: white; 
              text-decoration: none; 
              padding: 15px 30px; 
              border-radius: 5px; 
              font-weight: bold;
              display: inline-block;
              transition: background 0.3s;
            }
            .home-link:hover {
              background: #0056b3;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ تم إلغاء الاشتراك بنجاح</div>
            
            <div class="message">
              تم إلغاء اشتراك البريد الإلكتروني التالي من النشرة البريدية اليومية:
            </div>
            
            <div class="email">${tokenResult.email}</div>
            
            <div class="message">
              لن تصلك المزيد من رسائل النشرة البريدية اليومية للأحاديث النبوية الشريفة.
              <br><br>
              شكراً لك على استخدام خدماتنا. يمكنك الاشتراك مرة أخرى في أي وقت من الموقع الرئيسي.
            </div>
            
            <a href="/" class="home-link">🏠 العودة إلى موقع القرآن الكريم</a>
            
            <div class="footer">
              موقع القرآن الكريم - ${new Date().getFullYear()}
            </div>
          </div>
        </body>
        </html>
      `);
    } else {
      throw new Error('فشل في حذف المشترك من قاعدة البيانات');
    }

  } catch (error) {
    console.error('خطأ في تأكيد إلغاء الاشتراك:', error);
    
    return res.status(500).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>خطأ في الخادم</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
          .home-link { color: #007bff; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">❌ خطأ في الخادم</div>
          <p>حدث خطأ أثناء معالجة طلبك. يرجى المحاولة لاحقاً.</p>
          <a href="/" class="home-link">العودة إلى الموقع الرئيسي</a>
        </div>
      </body>
      </html>
    `);
  }
}
