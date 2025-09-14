// src/utils/validation.js
// مساعدة للتحقق من صحة البيانات

/**
 * تنظيف وتحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {string} - البريد الإلكتروني المنظف
 * @throws {Error} - في حالة البريد الإلكتروني غير صحيح
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('البريد الإلكتروني مطلوب');
  }

  // إزالة المسافات الإضافية
  const cleanEmail = email.trim().toLowerCase();

  // التحقق من صحة تنسيق البريد الإلكتروني
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('تنسيق البريد الإلكتروني غير صحيح');
  }

  // التحقق من طول البريد الإلكتروني
  if (cleanEmail.length > 254) {
    throw new Error('البريد الإلكتروني طويل جداً');
  }

  return cleanEmail;
}

/**
 * التحقق من صحة رمز الإلغاء
 * @param {string} token - الرمز المميز
 * @returns {boolean} - صحيح إذا كان الرمز صحيح
 */
export function validateUnsubscribeToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // التحقق من طول الرمز (يجب أن يكون 32 حرف للرموز hex)
  if (token.length !== 32) {
    return false;
  }

  // التحقق من أن الرمز يحتوي على أحرف hex فقط
  const hexRegex = /^[a-f0-9]+$/i;
  return hexRegex.test(token);
}

/**
 * تنظيف النص من الأحرف الخطيرة
 * @param {string} text - النص المدخل
 * @returns {string} - النص المنظف
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .replace(/[<>]/g, '') // إزالة أحرف HTML خطيرة
    .substring(0, 1000); // حد أقصى 1000 حرف
}

/**
 * التحقق من معدل الطلبات
 * @param {Map} rateLimitMap - خريطة تتبع الطلبات
 * @param {string} identifier - معرف العميل (IP, email, etc.)
 * @param {number} maxRequests - الحد الأقصى للطلبات
 * @param {number} windowMs - نافزة الوقت بالميلي ثانية
 * @returns {boolean} - true إذا كان مسموح، false إذا تم تجاوز الحد
 */
export function checkRateLimit(rateLimitMap, identifier, maxRequests = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = identifier;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const limit = rateLimitMap.get(key);

  if (now > limit.resetTime) {
    // إعادة تعيين العداد
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false; // تم تجاوز الحد الأقصى
  }

  // زيادة العداد
  limit.count++;
  return true;
}

/**
 * تنظيف خريطة معدل الطلبات من العناصر المنتهية الصلاحية
 * @param {Map} rateLimitMap - خريطة تتبع الطلبات
 */
export function cleanupRateLimit(rateLimitMap) {
  const now = Date.now();
  
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}
