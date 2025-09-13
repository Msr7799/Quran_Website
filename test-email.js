import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

async function testEmail() {
  console.log('🔍 اختبار إعدادات البريد الإلكتروني...');
  console.log('Gmail User:', process.env.GMAIL_USER);
  console.log('Gmail Password:', process.env.GMAIL_APP_PASSWORD ? '***مخفي***' : 'غير محدد');
  console.log('Email From:', process.env.EMAIL_FROM);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    // التحقق من الاتصال
    console.log('⏳ فحص الاتصال مع خوادم Gmail...');
    const verified = await transporter.verify();
    console.log('✅ الاتصال مع Gmail نجح:', verified);

    // إرسال رسالة تجريبية
    console.log('📧 إرسال رسالة تجريبية...');
    const info = await transporter.sendMail({
      from: {
        name: 'موقع القرآن الكريم - اختبار',
        address: process.env.EMAIL_FROM
      },
      to: process.env.GMAIL_USER,
      subject: '🧪 اختبار النظام - موقع القرآن الكريم',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #009d9d;">اختبار النظام</h2>
          <p>هذه رسالة تجريبية للتأكد من عمل نظام البريد الإلكتروني.</p>
          <p>إذا وصلتك هذه الرسالة، فإن النظام يعمل بشكل صحيح! ✅</p>
        </div>
      `
    });

    console.log('✅ تم إرسال الرسالة التجريبية بنجاح!');
    console.log('Message ID:', info.messageId);
    return true;

  } catch (error) {
    console.error('❌ خطأ في اختبار البريد الإلكتروني:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 المشكلة في المصادقة (Authentication):');
      console.log('- تأكد من صحة Gmail App Password');
      console.log('- تأكد من تفعيل التحقق بخطوتين في حساب Google');
    }
    
    return false;
  }
}

testEmail().then(result => {
  console.log(result ? '🎉 الاختبار نجح!' : '💥 الاختبار فشل!');
  process.exit(result ? 0 : 1);
});
