import nodemailer from 'nodemailer';
import { getSubscribers } from '../../utils/mongoDataStorage.js';
import { generateUnsubscribeToken } from '../../utils/encryption.js';

// Rate limiting storage (in production use Redis/database)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 2; // 2 requests per minute

// تحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// التحقق من Rate Limiting
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // إزالة الطلبات القديمة
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  // إضافة الطلب الحالي
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }

  // فحص متغيرات البيئة المطلوبة
  const requiredEnvVars = ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'UNSUBSCRIBE_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ متغيرات البيئة مفقودة:', missingVars);
    return res.status(500).json({ 
      error: 'خطأ في إعدادات الخادم. يرجى المحاولة لاحقاً.'
    });
  }

  console.log('✅ جميع متغيرات البيئة متوفرة');
  console.log('📧 Gmail User:', process.env.GMAIL_USER);
  console.log('🔗 Base URL:', process.env.SITE_URL || process.env.NEXT_PUBLIC_BASE_URL);

  try {
    const { email } = req.body;
    
    // تنظيف وتحقق من البريد الإلكتروني
    if (!email || !isValidEmail(email.trim())) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير صالح' });
    }
    
    const sanitizedEmail = email.trim().toLowerCase();

    // فحص Rate Limiting
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ 
        error: 'تم تجاوز الحد المسموح من المحاولات. يرجى المحاولة بعد دقيقة.',
        retryAfter: 60
      });
    }

    // التحقق من وجود البريد الإلكتروني في قائمة المشتركين
    const subscribers = await getSubscribers();
    const isSubscribed = subscribers.includes(sanitizedEmail);
    
    if (!isSubscribed) {
      return res.status(404).json({ 
        error: 'هذا البريد الإلكتروني غير مشترك في النشرة البريدية'
      });
    }
    
    // إنشاء token آمن
    const unsubscribeToken = generateUnsubscribeToken(sanitizedEmail);
    
    // إنشاء رابط إلغاء الاشتراك (مرن للإنتاج واللوكال هوست)
    const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
    const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
    
    // إعداد nodemailer مع تفاصيل إضافية للتشخيص
    console.log('🔧 إعداد NodeMailer transporter...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: process.env.NODE_ENV === 'development', // تفعيل debug في التطوير فقط
      logger: process.env.NODE_ENV === 'development' // تفعيل logger في التطوير فقط
    });

    // اختبار الاتصال مع Gmail
    try {
      await transporter.verify();
      console.log('✅ تم التحقق من الاتصال مع Gmail بنجاح');
    } catch (verifyError) {
      console.error('❌ فشل في التحقق من الاتصال مع Gmail:');
      console.error('Verify Error:', verifyError.message);
      throw new Error('فشل في الاتصال مع خادم البريد الإلكتروني');
    }

    // قالب الإيميل
    const emailHtml = `
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>تأكيد إلغاء الاشتراك</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📧 تأكيد إلغاء الاشتراك</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">السلام عليكم ورحمة الله وبركاته</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            لقد طلبت إلغاء اشتراكك في النشرة البريدية اليومية للأحاديث النبوية الشريفة من موقع القرآن الكريم.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              ⚠️ <strong>تنبيه:</strong> هذا الرابط صالح لمدة 24 ساعة فقط من وقت إرسال هذا الإيميل.
            </p>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            إذا كنت متأكداً من رغبتك في إلغاء الاشتراك، يرجى النقر على الزر أدناه:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${unsubscribeUrl}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
              🗑️ تأكيد إلغاء الاشتراك
            </a>
          </div>
          
          <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #0c5460; font-size: 14px;">
              💡 <strong>لم تطلب إلغاء الاشتراك؟</strong><br>
              إذا لم تطلب إلغاء الاشتراك، يمكنك تجاهل هذا الإيميل بأمان. اشتراكك سيبقى فعالاً.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            شكراً لك على استخدام خدماتنا. نتمنى أن تكون قد استفدت من النشرة البريدية.
          </p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
          <p>موقع القرآن الكريم | ${new Date().getFullYear()}</p>
          <p>تم إرسال هذا الإيميل بناءً على طلبك لإلغاء الاشتراك</p>
        </div>
      </body>
      </html>
    `;

    // إرسال الإيميل
    try {
      // تسجيل محاولة الإرسال
      console.log(`📤 محاولة إرسال إيميل إلغاء اشتراك إلى: ${sanitizedEmail}`);
      
      const info = await transporter.sendMail({
        from: `"موقع القرآن الكريم" <${process.env.GMAIL_USER}>`,
        to: sanitizedEmail,
        subject: '📧 تأكيد إلغاء الاشتراك - موقع القرآن الكريم',
        html: emailHtml
      });

      console.log(`✅ تم إرسال إيميل إلغاء الاشتراك بنجاح! Message ID: ${info.messageId}`);

      res.status(200).json({
        success: true,
        message: 'تم إرسال رابط تأكيد إلغاء الاشتراك إلى بريدك الإلكتروني'
      });
      
    } catch (emailError) {
      console.error('❌ خطأ تفصيلي في إرسال إيميل إلغاء الاشتراك:');
      console.error('Gmail Error Code:', emailError.code);
      console.error('Gmail Error Message:', emailError.message);
      console.error('Full Error:', emailError);
      
      throw emailError; // إعادة رمي الخطأ للمعالج الرئيسي
    }

  } catch (error) {
    console.error('❌ خطأ عام في إرسال رابط إلغاء الاشتراك:', error);
    
    res.status(500).json({ 
      error: 'حدث خطأ في إرسال رابط التأكيد. يرجى المحاولة لاحقاً.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
