# 🕌 نشرة الأحاديث اليومية

نظام اشتراك بريد إلكتروني يومي لإرسال الأحاديث النبوية الشريفة من صحيح البخاري وصحيح مسلم.

## 🚀 المتطلبات

- Node.js (الإصدار 16 أو أحدث)
- npm أو yarn
- حساب Postmark لإرسال الإيميلات
- مفتاح API من hadithapi.com

## 📦 التثبيت

1. **تثبيت التبعيات:**
```bash
cd hadith-newsletter
npm install
```

2. **إعداد متغيرات البيئة:**
```bash
# انسخ ملف .env وعدل القيم
cp .env .env.local
```

عدل الملف `.env` وأدخل القيم الصحيحة:
```env
EMAIL_API_KEY=your-postmark-api-key-here
EMAIL_FROM=your-verified-sender-email@yourdomain.com
HADITH_API_KEY=$2y$10$SkIzIKolTdgbZlfDLbfdQVJbGM50UGKqu2EFPPPpfhkUDFfGzYa
PORT=3001
SITE_URL=http://localhost:3001
```

## 🔧 إعداد Postmark

1. سجل حساب في [Postmark](https://postmarkapp.com)
2. احصل على Server API Token
3. تأكد من تفعيل البريد المرسل في Postmark
4. أدخل API Key في ملف `.env`

## 🏃 التشغيل

### التطوير:
```bash
npm run dev
```

### الإنتاج:
```bash
npm start
```

الخادم سيعمل على: `http://localhost:3001`

## 📡 API Endpoints

### 1. اشتراك جديد
```http
POST /subscribe
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**الاستجابة:**
```json
{
  "ok": true,
  "message": "تم الاشتراك بنجاح! تفقد بريدك الإلكتروني"
}
```

### 2. إلغاء الاشتراك
```http
GET /unsubscribe?email=user@example.com
```

### 3. إرسال الحديث اليومي
```http
POST /send-daily
```

### 4. عرض المشتركين
```http
GET /subscribers
```

## 🎯 استخدام النظام في التطبيق الرئيسي

تم تعديل Footer في التطبيق الرئيسي ليتكامل مع نظام الاشتراك:

1. **تشغيل خادم الأحاديث:**
```bash
cd hadith-newsletter
npm run dev
```

2. **تشغيل التطبيق الرئيسي:**
```bash
# في المجلد الرئيسي
npm run dev
```

3. **الاستخدام:**
   - اذهب للفوتر في الموقع
   - أدخل البريد الإلكتروني
   - اضغط "اشتراك"
   - ستظهر رسالة نجاح وستصل رسالة ترحيب

## 📅 جدولة الإرسال اليومي

لإرسال الأحاديث تلقائياً كل يوم، يمكنك:

### 1. استخدام Cron Job (Linux/Mac):
```bash
# إضافة إلى crontab
crontab -e

# إرسال يومياً الساعة 8 صباحاً
0 8 * * * curl -X POST http://localhost:3001/send-daily
```

### 2. استخدام مجدول Windows:
```batch
# إنشاء bat file
curl -X POST http://localhost:3001/send-daily
```

### 3. استخدام خدمات السحابة:
- Vercel Cron Jobs
- Netlify Functions
- AWS Lambda

## 🏗️ هيكل المشروع

```
hadith-newsletter/
├── server.js          # الخادم الرئيسي
├── package.json       # تبعيات المشروع
├── .env              # متغيرات البيئة
└── README.md         # هذا الملف
```

## 🔒 الأمان

- ✅ التحقق من صحة الإيميل
- ✅ تنظيف البيانات المدخلة
- ✅ معالجة الأخطاء
- ✅ CORS مفعل
- ✅ رابط إلغاء الاشتراك في كل إيميل

## 🐛 استكشاف الأخطاء

### خطأ في الاتصال بـ Postmark:
- تأكد من صحة EMAIL_API_KEY
- تأكد من تفعيل البريد المرسل في Postmark

### خطأ في Hadith API:
- تأكد من صحة HADITH_API_KEY
- تحقق من حدود الاستخدام للـ API

### الإيميلات لا تصل:
- تحقق من مجلد الرسائل المزعجة
- تأكد من تفعيل البريد في Postmark
- تحقق من سجلات Postmark

## 📊 المراقبة

عرض إحصائيات المشتركين:
```bash
curl http://localhost:3001/subscribers
```

## 🤝 المساهمة

هذا المشروع مفتوح المصدر. يمكنك:
- إضافة ميزات جديدة
- تحسين التصميم
- إصلاح الأخطاء
- تحسين الأداء

## 📄 الترخيص

MIT License - يمكنك استخدام الكود بحرية

---

**ملاحظة:** تأكد من تشغيل خادم الأحاديث على المنفذ 3001 قبل استخدام نموذج الاشتراك في الموقع الرئيسي.