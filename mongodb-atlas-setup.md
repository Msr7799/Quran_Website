# 🚀 إعداد MongoDB Atlas Triggers للحديث اليومي

## 📋 **خطوات الإعداد:**

### **1️⃣ فتح MongoDB Atlas Console:**
- اذهب لـ: https://cloud.mongodb.com
- سجل دخول بحسابك
- اختر Project: `quran-website-alm`

### **2️⃣ إنشاء App Service:**
```
📱 من الشريط الجانبي: "App Services"
➕ انقر "Create a New App"
📝 App Name: "quran-daily-hadith"
🔗 Link Data Source: "quran-website-alm"
🌍 Environment: "Production"
✅ انقر "Create App Service"
```

### **3️⃣ إنشاء Atlas Function:**
```javascript
// اسم الدالة: sendDailyHadithBahrain
exports = async function() {
  try {
    console.log("🕌 بدء إرسال الحديث اليومي الساعة 7:00 ص البحرين");
    
    const response = await context.http.post({
      url: "https://msr-quran-app.vercel.app/api/scheduled/daily-hadith",
      headers: {
        "Content-Type": ["application/json"],
        "User-Agent": ["MongoDB-Atlas-Scheduler/1.0"]
      },
      body: JSON.stringify({
        source: "mongodb_atlas_trigger",
        timezone: "Asia/Bahrain",
        scheduled_time: "07:00"
      })
    });

    const result = response.body.text();
    console.log("✅ نتيجة الإرسال:", result);
    
    return {
      success: true,
      timestamp: new Date(),
      response: result,
      bahrain_time: new Date().toLocaleString("en-US", {timeZone: "Asia/Bahrain"})
    };
    
  } catch (error) {
    console.error("❌ خطأ في إرسال الحديث:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  }
};
```

### **4️⃣ إنشاء Scheduled Trigger:**
```json
{
  "name": "daily_hadith_7AM_bahrain",
  "type": "SCHEDULED",
  "config": {
    "schedule": "0 4 * * *",
    "skip_catchup": true
  },
  "function_name": "sendDailyHadithBahrain",
  "disabled": false
}
```

### **5️⃣ التفعيل والاختبار:**
- احفظ جميع الإعدادات
- فعّل الـ Trigger
- اختبر الـ Function يدوياً أول مرة
- راقب اللوقز في Atlas Console

---

## ⏰ **معلومات التوقيت:**

- **Cron Expression:** `0 4 * * *`
- **التوقيت:** 4:00 صباحاً UTC
- **بتوقيت البحرين:** 7:00 صباحاً (UTC+3) ✅
- **التكرار:** يومياً

---

## 💰 **التكلفة:**
- **مجاني 100%** في MongoDB Atlas Free Tier
- **الحد الأقصى:** 1,000,000 executions/month
- **الاستخدام المتوقع:** 30 executions/month
- **النسبة:** 0.003% من الحد المسموح

---

## 🎯 **المميزات:**
✅ **موثوقية عالية** - يعمل حتى لو الموقع sleeping  
✅ **لوقز مفصلة** - مراقبة كاملة من MongoDB Console  
✅ **نظام محدث** - يقرأ الأحاديث من MongoDB الآن  
✅ **Fallback آمن** - يعود للملف المحلي إذا فشل MongoDB  
✅ **منع التكرار** - نظام ذكي يضمن إرسال واحد يومياً  

---

## 📊 **مراقبة النظام:**
- اذهب لـ App Services → Functions → Logs
- راقب اللوقز يومياً للتأكد من العمل
- تحقق من إحصائيات الإرسال في `/api/admin/stats`

**النظام الآن محدث ويقرأ من MongoDB Atlas مع fallback للملف المحلي!** 🚀
