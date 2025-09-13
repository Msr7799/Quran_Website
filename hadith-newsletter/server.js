const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Client } = require('postmark');
const validator = require('validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// مصفوفة لتخزين الاشتراكات في الذاكرة
let subscribers = [];

// Postmark client
const postmarkClient = new Client(process.env.EMAIL_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// دالة لإنشاء قالب HTML للترحيب
const createWelcomeEmailTemplate = (email) => {
  const currentDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مرحباً بك في نشرة الأحاديث اليومية</title>
    <style>
        body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-top: 4px solid #2e7d32;
        }
        .header {
            text-align: center;
            color: #2e7d32;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 20px;
        }
        .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .unsubscribe-link {
            color: #666;
            text-decoration: none;
        }
        .date {
            background: #f0f8f0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 20px;
            color: #2e7d32;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🕌 مرحباً بك في نشرة الأحاديث اليومية</h1>
        </div>
        
        <div class="date">
            ${currentDate}
        </div>
        
        <div class="content">
            <p>السلام عليكم ورحمة الله وبركاته،</p>
            
            <p>نشكرك على اشتراكك في نشرة الأحاديث اليومية. سنرسل لك يومياً حديثاً شريفاً من صحيح البخاري أو صحيح مسلم.</p>
            
            <p>هذه الخدمة مجانية تماماً وتهدف إلى نشر السنة النبوية المباركة.</p>
            
            <p><strong>ماذا ستستقبل؟</strong></p>
            <ul>
                <li>حديث شريف يومي من الصحيحين</li>
                <li>المصدر والراوي</li>
                <li>تصميم جميل وسهل القراءة</li>
            </ul>
            
            <p>نسأل الله أن ينفعك بما تقرأ وأن يجعله في ميزان حسناتك.</p>
            
            <p>بارك الله فيك</p>
        </div>
        
        <div class="footer">
            <p>إذا كنت لا ترغب في استقبال هذه الرسائل، يمكنك 
            <a href="${process.env.SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}" class="unsubscribe-link">إلغاء الاشتراك</a></p>
        </div>
    </div>
</body>
</html>`;
};

// دالة لإنشاء قالب HTML للحديث اليومي
const createHadithEmailTemplate = (hadith, email) => {
  const currentDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>حديث اليوم - ${currentDate}</title>
    <style>
        body {
            font-family: 'Arial', 'Tahoma', sans-serif;
            line-height: 1.8;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-top: 4px solid #2e7d32;
        }
        .header {
            text-align: center;
            color: #2e7d32;
            margin-bottom: 30px;
        }
        .hadith-text {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-right: 4px solid #2e7d32;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 20px;
        }
        .source {
            text-align: left;
            color: #666;
            font-style: italic;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .date {
            background: #e8f5e8;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 20px;
            color: #2e7d32;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🕌 حديث اليوم</h1>
        </div>
        
        <div class="date">
            ${currentDate}
        </div>
        
        <div class="hadith-text">
            ${hadith.hadithText || hadith.arab}
            
            <div class="source">
                <strong>المصدر:</strong> ${hadith.book || 'صحيح البخاري'} - 
                <strong>الراوي:</strong> ${hadith.englishNarrator || 'غير محدد'}
            </div>
        </div>
        
        <div class="footer">
            <p>نسأل الله أن ينفعك بهذا الحديث الشريف</p>
            <p>إذا كنت لا ترغب في استقبال هذه الرسائل، يمكنك 
            <a href="${process.env.SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}">إلغاء الاشتراك</a></p>
        </div>
    </div>
</body>
</html>`;
};

// POST /subscribe - اشتراك جديد
app.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // التحقق من صحة الإيميل
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ 
        ok: false, 
        message: 'يرجى إدخال بريد إلكتروني صحيح' 
      });
    }

    // التحقق من عدم وجود الإيميل مسبقاً
    if (subscribers.includes(email)) {
      return res.status(400).json({ 
        ok: false, 
        message: 'هذا البريد الإلكتروني مشترك بالفعل' 
      });
    }

    // إضافة الإيميل للمشتركين
    subscribers.push(email);
    console.log('📧 إيميل جديد مشترك:', email);
    console.log('👥 إجمالي المشتركين:', subscribers.length);

    // إرسال رسالة ترحيب
    try {
      await postmarkClient.sendEmail({
        From: process.env.EMAIL_FROM,
        To: email,
        Subject: 'مرحباً بك في نشرة الأحاديث اليومية 🕌',
        HtmlBody: createWelcomeEmailTemplate(email),
        MessageStream: 'outbound'
      });
      
      console.log('✅ تم إرسال رسالة الترحيب إلى:', email);
    } catch (emailError) {
      console.error('❌ خطأ في إرسال رسالة الترحيب:', emailError);
      // لا نحذف الاشتراك حتى لو فشل الإيميل
    }

    res.json({ 
      ok: true, 
      message: 'تم الاشتراك بنجاح! تفقد بريدك الإلكتروني' 
    });

  } catch (error) {
    console.error('❌ خطأ في الاشتراك:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'حدث خطأ أثناء الاشتراك' 
    });
  }
});

// GET /unsubscribe - إلغاء الاشتراك
app.get('/unsubscribe', (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.send(`
        <html dir="rtl">
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2>❌ خطأ</h2>
            <p>البريد الإلكتروني غير محدد</p>
          </body>
        </html>
      `);
    }

    // حذف الإيميل من المشتركين
    const index = subscribers.indexOf(email);
    if (index > -1) {
      subscribers.splice(index, 1);
      console.log('🗑️ تم إلغاء اشتراك:', email);
      console.log('👥 إجمالي المشتركين:', subscribers.length);
    }

    res.send(`
      <html dir="rtl">
        <body style="font-family: Arial; text-align: center; padding: 50px; background: #f9f9f9;">
          <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2e7d32;">✅ تم إلغاء الاشتراك</h2>
            <p>تم إلغاء اشتراكك في نشرة الأحاديث اليومية بنجاح</p>
            <p style="color: #666; font-size: 14px;">نأسف لرؤيتك تغادر، ونتمنى أن تعود قريباً</p>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ خطأ في إلغاء الاشتراك:', error);
    res.status(500).send(`
      <html dir="rtl">
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2>❌ خطأ</h2>
          <p>حدث خطأ أثناء إلغاء الاشتراك</p>
        </body>
      </html>
    `);
  }
});

// POST /send-daily - إرسال الحديث اليومي
app.post('/send-daily', async (req, res) => {
  try {
    if (subscribers.length === 0) {
      return res.json({ 
        ok: false, 
        message: 'لا يوجد مشتركين' 
      });
    }

    console.log('📖 جلب حديث اليوم...');
    
    // جلب حديث عشوائي من API
    const hadithResponse = await axios.get('https://hadithapi.com/public/api/hadiths', {
      params: {
        apiKey: process.env.HADITH_API_KEY,
        book: Math.random() > 0.5 ? 'muslim' : 'bukhari', // اختيار عشوائي بين البخاري ومسلم
        random: 1
      }
    });

    if (!hadithResponse.data || !hadithResponse.data.hadiths || hadithResponse.data.hadiths.length === 0) {
      throw new Error('لم يتم العثور على أحاديث');
    }

    const hadith = hadithResponse.data.hadiths[0];
    console.log('✅ تم جلب الحديث:', hadith.hadithText?.substring(0, 100) + '...');

    // إرسال الحديث لكل المشتركين
    let successCount = 0;
    let failureCount = 0;

    for (const email of subscribers) {
      try {
        await postmarkClient.sendEmail({
          From: process.env.EMAIL_FROM,
          To: email,
          Subject: `🕌 حديث اليوم - ${new Date().toLocaleDateString('ar-SA')}`,
          HtmlBody: createHadithEmailTemplate(hadith, email),
          MessageStream: 'outbound'
        });
        
        successCount++;
        console.log(`✅ تم إرسال الحديث إلى: ${email}`);
      } catch (emailError) {
        failureCount++;
        console.error(`❌ فشل إرسال الحديث إلى ${email}:`, emailError.message);
      }
    }

    res.json({ 
      ok: true, 
      message: `تم إرسال الحديث اليومي بنجاح إلى ${successCount} مشترك${failureCount > 0 ? ` (فشل: ${failureCount})` : ''}` 
    });

  } catch (error) {
    console.error('❌ خطأ في إرسال الحديث اليومي:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'حدث خطأ أثناء إرسال الحديث اليومي' 
    });
  }
});

// GET /subscribers - عرض عدد المشتركين (للمطور)
app.get('/subscribers', (req, res) => {
  res.json({
    count: subscribers.length,
    subscribers: subscribers.map(email => email.replace(/(.{2}).*(@.*)/, '$1***$2')) // إخفاء جزء من الإيميل للخصوصية
  });
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.send(`
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>نشرة الأحاديث اليومية</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; background: #f9f9f9; }
          .container { background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🕌 نشرة الأحاديث اليومية</h1>
          <p>خدمة إرسال حديث شريف يومي من صحيح البخاري وصحيح مسلم</p>
          <p><strong>المشتركين الحاليين:</strong> ${subscribers.length}</p>
          <hr>
          <h3>📡 APIs المتاحة:</h3>
          <ul style="text-align: right;">
            <li><code>POST /subscribe</code> - اشتراك جديد</li>
            <li><code>GET /unsubscribe</code> - إلغاء الاشتراك</li>
            <li><code>POST /send-daily</code> - إرسال الحديث اليومي</li>
            <li><code>GET /subscribers</code> - عرض المشتركين</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 خادم نشرة الأحاديث يعمل على المنفذ ${PORT}`);
  console.log(`📧 إعدادات الإيميل: ${process.env.EMAIL_FROM}`);
  console.log(`👥 المشتركين الحاليين: ${subscribers.length}`);
});