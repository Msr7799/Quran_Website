import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { connectToDatabase } from '../../utils/mongoDataStorage.js';
import { sanitizeEmail } from '../../utils/validation.js';

// Rate limiting storage (in production use Redis/database)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 2; // 2 requests per minute

// إنشاء token مشفر
function createUnsubscribeToken(email) {
  const timestamp = Date.now();
  const data = `${email}:${timestamp}`;
  const token = crypto.createHash('sha256').update(data + process.env.UNSUBSCRIBE_SECRET).digest('hex');
  return `${Buffer.from(data).toString('base64')}.${token}`;
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    // تنظيف وتحقق من البريد الإلكتروني
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return res.status(400).json({ error: 'البريد الإلكتروني غير صالح' });
    }

    // فحص Rate Limiting
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ 
        error: 'تم تجاوز الحد المسموح من المحاولات. يرجى المحاولة بعد دقيقة.',
        retryAfter: 60
      });
    }

    // الاتصال بقاعدة البيانات
    const { db } = await connectToDatabase();
    
    // التحقق من وجود البريد الإلكتروني
    const existingSubscriber = await db.collection('subscribers').findOne({
      email: sanitizedEmail
    });

    if (!existingSubscriber) {
      return res.status(404).json({ 
        error: 'هذا البريد الإلكتروني غير مشترك في النشرة البريدية'
      });
    }

    // إنشاء token آمن
    const unsubscribeToken = createUnsubscribeToken(sanitizedEmail);
    
    // إنشاء رابط إلغاء الاشتراك
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/confirm-unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

    // إعداد NodeMailer
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // قالب الإيميل
    const emailHtml = `
      <!DOCTYPE html>
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
    await transporter.sendMail({
      from: `"موقع القرآن الكريم" <${process.env.EMAIL_USER}>`,
      to: sanitizedEmail,
      subject: '📧 تأكيد إلغاء الاشتراك - موقع القرآن الكريم',
      html: emailHtml
    });

    res.status(200).json({
      success: true,
      message: 'تم إرسال رابط تأكيد إلغاء الاشتراك إلى بريدك الإلكتروني'
    });

  } catch (error) {
    console.error('خطأ في إرسال رابط إلغاء الاشتراك:', error);
    res.status(500).json({ 
      error: 'حدث خطأ في إرسال رابط التأكيد. يرجى المحاولة لاحقاً.'
    });
  }
}
