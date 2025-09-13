import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'quran-hadith-newsletter-secret-key-2024';

// تشفير البيانات
export function encryptData(data) {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('خطأ في تشفير البيانات:', error);
    return null;
  }
}

// فك تشفير البيانات
export function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    console.error('خطأ في فك تشفير البيانات:', error);
    return null;
  }
}

// إنشاء مفتاح إلغاء اشتراك آمن
export function generateUnsubscribeToken(email) {
  const data = {
    email,
    timestamp: Date.now(),
    type: 'unsubscribe'
  };
  return encryptData(data);
}

// التحقق من صحة مفتاح إلغاء الاشتراك
export function verifyUnsubscribeToken(token) {
  const data = decryptData(token);
  if (!data || data.type !== 'unsubscribe') {
    return null;
  }
  
  // التحقق من أن المفتاح لا يتجاوز 7 أيام
  const now = Date.now();
  const tokenAge = now - data.timestamp;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  
  if (tokenAge > sevenDays) {
    return null;
  }
  
  return data.email;
}
