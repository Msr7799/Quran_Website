// قوالب الإيميل باللغة العربية
export function createWelcomeEmailTemplate(email, unsubscribeToken) {
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
    <title>مرحباً بك في نشرة الأحاديث اليومية - موقع القرآن الكريم</title>
    <style>
        body {
            font-family: 'Tahoma', 'Arial', sans-serif;
            line-height: 1.8;
            color: #2c3e50;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
        }
        .container {
            background: linear-gradient(135deg, #ffffff, #f8f9fa);
            border-radius: 20px;
            padding: 40px;
            margin: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border-top: 5px solid #2e7d32;
            border-bottom: 3px solid #4caf50;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            color: #2e7d32;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .date {
            background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 25px;
            color: #2e7d32;
            font-weight: bold;
            border: 2px solid #4caf50;
        }
        .content {
            margin-bottom: 25px;
            font-size: 16px;
        }
        .welcome-message {
            background: #fff3e0;
            padding: 20px;
            border-radius: 15px;
            border-right: 5px solid #ff9800;
            margin: 20px 0;
        }
        .features {
            background: #f3e5f5;
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
        }
        .features ul {
            margin: 0;
            padding-right: 20px;
        }
        .features li {
            margin: 10px 0;
            color: #6a1b9a;
        }
        .footer {
            border-top: 2px solid #e0e0e0;
            padding-top: 20px;
            font-size: 14px;
            color: #666;
            text-align: center;
            margin-top: 30px;
        }
        .unsubscribe-link {
            color: #d32f2f;
            text-decoration: none;
            font-weight: bold;
        }
        .unsubscribe-link:hover {
            text-decoration: underline;
        }
        .signature {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
            color: #1565c0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🕌 موقع القرآن الكريم</div>
            <h1 style="color: #2e7d32; margin: 0;">مرحباً بك في نشرة الأحاديث اليومية</h1>
        </div>
        
        <div class="date">
            📅 ${currentDate}
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h3 style="color: #e65100; margin-top: 0;">🌟 السلام عليكم ورحمة الله وبركاته</h3>
                <p><strong>نشكرك من أعماق قلوبنا</strong> على اشتراكك في نشرة الأحاديث اليومية من موقع القرآن الكريم.</p>
                <p>هذه الخدمة المجانية تهدف إلى نشر السنة النبوية المباركة وإحياء سنة النبي محمد ﷺ في قلوب المؤمنين.</p>
            </div>
            
            <div class="features">
                <h3 style="color: #6a1b9a; margin-top: 0;">📋 ماذا ستستقبل؟</h3>
                <ul>
                    <li><strong>حديث شريف يومي</strong> من صحيح البخاري أو صحيح مسلم</li>
                    <li><strong>المصدر والراوي</strong> كاملين للتأكد من الصحة</li>
                    <li><strong>تصميم جميل</strong> وسهل القراءة على جميع الأجهزة</li>
                    <li><strong>وقت مناسب</strong> للتذكير والتدبر</li>
                </ul>
            </div>
            
            <div class="signature">
                <p><strong>🤲 نسأل الله أن ينفعك بما تقرأ</strong></p>
                <p>وأن يجعله في ميزان حسناتك وحسناتنا</p>
                <p><strong>بارك الله فيك وجزاك الله خيراً</strong></p>
            </div>
        </div>
        
        <div class="footer">
            <p>💌 هذه الرسالة من موقع القرآن الكريم</p>
            <p>إذا كنت لا ترغب في استقبال هذه الرسائل، يمكنك 
            <a href="${process.env.SITE_URL}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}" class="unsubscribe-link">إلغاء الاشتراك من هنا</a></p>
            <p style="font-size: 12px; margin-top: 15px;">
                مطور الموقع: محمد الرميحي | CODE4EVER11@GMAIL.COM
            </p>
        </div>
    </div>
</body>
</html>`;
}

export function createHadithEmailTemplate(hadith, email, unsubscribeToken) {
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
    <title>حديث اليوم - ${currentDate} - موقع القرآن الكريم</title>
    <style>
        body {
            font-family: 'Tahoma', 'Arial', sans-serif;
            line-height: 1.9;
            color: #2c3e50;
            max-width: 650px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
        }
        .container {
            background: linear-gradient(135deg, #ffffff, #f8f9fa);
            border-radius: 20px;
            padding: 40px;
            margin: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            border-top: 6px solid #2e7d32;
        }
        .header {
            text-align: center;
            margin-bottom: 35px;
        }
        .logo {
            font-size: 22px;
            color: #2e7d32;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .date {
            background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
            padding: 18px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 30px;
            color: #1b5e20;
            font-weight: bold;
            font-size: 16px;
            border: 2px solid #4caf50;
        }
        .hadith-container {
            background: linear-gradient(135deg, #fff9c4, #f9fbe7);
            padding: 30px;
            border-radius: 20px;
            border-right: 6px solid #689f38;
            margin: 25px 0;
            position: relative;
        }
        .hadith-container::before {
            content: "💬";
            position: absolute;
            top: -10px;
            right: -10px;
            background: #689f38;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }
        .hadith-text {
            font-size: 18px;
            line-height: 2.2;
            color: #2e7d32;
            font-weight: 500;
            text-align: justify;
            margin-bottom: 20px;
        }
        .hadith-source {
            background: #e1f5fe;
            padding: 15px;
            border-radius: 10px;
            border-right: 4px solid #0277bd;
            color: #01579b;
            font-size: 14px;
            margin-top: 20px;
        }
        .reflection {
            background: #fce4ec;
            padding: 20px;
            border-radius: 15px;
            margin: 25px 0;
            border-right: 5px solid #e91e63;
        }
        .footer {
            border-top: 3px solid #e0e0e0;
            padding-top: 25px;
            font-size: 14px;
            color: #666;
            text-align: center;
            margin-top: 35px;
        }
        .unsubscribe-link {
            color: #d32f2f;
            text-decoration: none;
            font-weight: bold;
        }
        .dua {
            background: #f3e5f5;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            color: #4a148c;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🕌 موقع القرآن الكريم</div>
            <h1 style="color: #2e7d32; margin: 0;">📿 حديث اليوم</h1>
        </div>
        
        <div class="date">
            📅 ${currentDate}
        </div>
        
        <div class="hadith-container">
            <div class="hadith-text">
                "${hadith.hadithText || hadith.arab || 'النص غير متوفر'}"
            </div>
            
            <div class="hadith-source">
                <strong>📚 المصدر:</strong> ${hadith.book || 'صحيح البخاري'}<br>
                <strong>👤 الراوي:</strong> ${hadith.englishNarrator || hadith.narrator || 'غير محدد'}<br>
                ${hadith.hadithNumber ? `<strong>🔢 رقم الحديث:</strong> ${hadith.hadithNumber}<br>` : ''}
                ${hadith.chapter ? `<strong>📖 الباب:</strong> ${hadith.chapter}` : ''}
            </div>
        </div>
        
        <div class="reflection">
            <h4 style="color: #c2185b; margin-top: 0;">💡 للتأمل والتدبر</h4>
            <p>هذا الحديث الشريف يحمل في طياته هداية ونوراً من سنة نبينا محمد ﷺ.</p>
            <p>نسأل الله أن يوفقنا للعمل بما جاء فيه وأن يجعله نبراساً ينير دربنا.</p>
        </div>
        
        <div class="dua">
            🤲 اللهم انفعنا بما علمتنا وعلمنا ما ينفعنا وزدنا علماً
        </div>
        
        <div class="footer">
            <p>💌 نشرة الأحاديث اليومية من موقع القرآن الكريم</p>
            <p><strong>جزاكم الله خيراً على متابعتكم</strong></p>
            <p>إذا كنت لا ترغب في استقبال هذه الرسائل، يمكنك 
            <a href="${process.env.SITE_URL}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}" class="unsubscribe-link">إلغاء الاشتراك</a></p>
            <p style="font-size: 12px; margin-top: 15px;">
                مطور الموقع: محمد الرميحي | CODE4EVER11@GMAIL.COM
            </p>
        </div>
    </div>
</body>
</html>`;
}
