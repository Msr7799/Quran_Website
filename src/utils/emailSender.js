import nodemailer from 'nodemailer';
import { createWelcomeEmailTemplate, createHadithEmailTemplate } from './emailTemplates.js';
import { generateUnsubscribeToken } from './encryption.js';

// إعداد Nodemailer مع Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // استخدم App Password من Google
    },
  });
};

// إرسال رسالة ترحيب
export async function sendWelcomeEmail(email) {
  try {
    const transporter = createTransporter();
    const unsubscribeToken = generateUnsubscribeToken(email);
    
    const mailOptions = {
      from: {
        name: 'موقع القرآن الكريم - نشرة الأحاديث',
        address: process.env.EMAIL_FROM
      },
      to: email,
      subject: '🕌 مرحباً بك في نشرة الأحاديث اليومية - موقع القرآن الكريم',
      html: createWelcomeEmailTemplate(email, unsubscribeToken),
      priority: 'high'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ تم إرسال رسالة الترحيب إلى:', email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ خطأ في إرسال رسالة الترحيب:', error);
    throw new Error(`فشل إرسال رسالة الترحيب: ${error.message}`);
  }
}

// إرسال حديث يومي
export async function sendDailyHadithEmail(email, hadith) {
  try {
    const transporter = createTransporter();
    const unsubscribeToken = generateUnsubscribeToken(email);
    
    const currentDate = new Date().toLocaleDateString('ar-SA');
    
    const mailOptions = {
      from: {
        name: 'موقع القرآن الكريم - حديث اليوم',
        address: process.env.EMAIL_FROM
      },
      to: email,
      subject: `📿 حديث اليوم - ${currentDate} - موقع القرآن الكريم`,
      html: createHadithEmailTemplate(hadith, email, unsubscribeToken),
      priority: 'normal'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ تم إرسال الحديث اليومي إلى:', email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ خطأ في إرسال الحديث اليومي:', error);
    throw new Error(`فشل إرسال الحديث اليومي: ${error.message}`);
  }
}

// إرسال الحديث اليومي لجميع المشتركين
export async function sendDailyHadithToAll(subscribers, hadith) {
  const results = {
    successful: [],
    failed: []
  };

  for (const email of subscribers) {
    try {
      await sendDailyHadithEmail(email, hadith);
      results.successful.push(email);
      
      // إضافة تأخير قصير بين الرسائل لتجنب Rate Limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ فشل إرسال الحديث إلى ${email}:`, error.message);
      results.failed.push({ email, error: error.message });
    }
  }

  console.log(`📊 إجمالي النتائج - نجح: ${results.successful.length}, فشل: ${results.failed.length}`);
  return results;
}

// إرسال حديث لمشترك واحد
export async function sendDailyHadithToSubscriber(email, hadith) {
  try {
    const transporter = createTransporter();
    const unsubscribeToken = generateUnsubscribeToken(email);
    
    const currentDate = new Date().toLocaleDateString('ar-SA');
    
    const mailOptions = {
      from: {
        name: 'موقع القرآن الكريم - حديث اليوم',
        address: process.env.EMAIL_FROM
      },
      to: email,
      subject: `📿 حديثك الأول - ${currentDate} - موقع القرآن الكريم`,
      html: createHadithEmailTemplate(hadith, email, unsubscribeToken),
      priority: 'normal'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ تم إرسال الحديث للمشترك:', email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ خطأ في إرسال الحديث للمشترك:', error);
    return { success: false, error: error.message };
  }
}

// التحقق من إعدادات البريد الإلكتروني
export async function testEmailConfiguration() {
  try {
    const transporter = createTransporter();
    const testResult = await transporter.verify();
    console.log('✅ إعدادات البريد الإلكتروني صحيحة:', testResult);
    return { success: true };
  } catch (error) {
    console.error('❌ خطأ في إعدادات البريد الإلكتروني:', error);
    return { success: false, error: error.message };
  }
}
