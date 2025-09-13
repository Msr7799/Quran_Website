import { encryptData, decryptData } from './encryption.js';
import { promises as fs } from 'fs';
import path from 'path';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

// التأكد من وجود مجلد البيانات
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// قراءة المشتركين
export async function getSubscribers() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
    const encryptedSubscribers = JSON.parse(data);
    
    const decryptedSubscribers = encryptedSubscribers.map(encrypted => {
      const decrypted = decryptData(encrypted);
      return decrypted?.email || null;
    }).filter(Boolean);
    
    return decryptedSubscribers;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // الملف غير موجود، إرجاع مصفوفة فارغة
      return [];
    }
    console.error('خطأ في قراءة المشتركين:', error);
    return [];
  }
}

// إضافة مشترك جديد
export async function addSubscriber(email) {
  try {
    const subscribers = await getSubscribers();
    
    // التحقق من عدم وجود الإيميل مسبقاً
    if (subscribers.includes(email)) {
      throw new Error('هذا البريد الإلكتروني مشترك بالفعل');
    }
    
    const subscriberData = {
      email,
      subscribedAt: new Date().toISOString(),
      isActive: true
    };
    
    const encryptedData = encryptData(subscriberData);
    if (!encryptedData) {
      throw new Error('خطأ في تشفير البيانات');
    }
    
    // قراءة البيانات المشفرة الحالية
    let encryptedSubscribers = [];
    try {
      const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
      encryptedSubscribers = JSON.parse(data);
    } catch (error) {
      // الملف غير موجود أو فارغ
      encryptedSubscribers = [];
    }
    
    // إضافة المشترك الجديد
    encryptedSubscribers.push(encryptedData);
    
    // حفظ البيانات
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(encryptedSubscribers, null, 2));
    
    console.log('📧 تمت إضافة مشترك جديد:', email);
    return true;
  } catch (error) {
    console.error('خطأ في إضافة المشترك:', error);
    throw error;
  }
}

// حذف مشترك
export async function removeSubscriber(email) {
  try {
    // قراءة البيانات المشفرة
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
    const encryptedSubscribers = JSON.parse(data);
    
    // تصفية المشتركين (حذف الإيميل المطلوب)
    const filteredSubscribers = encryptedSubscribers.filter(encrypted => {
      const decrypted = decryptData(encrypted);
      return decrypted?.email !== email;
    });
    
    // حفظ البيانات المحدثة
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(filteredSubscribers, null, 2));
    
    console.log('🗑️ تم حذف المشترك:', email);
    return true;
  } catch (error) {
    console.error('خطأ في حذف المشترك:', error);
    throw error;
  }
}

// عدد المشتركين
export async function getSubscribersCount() {
  const subscribers = await getSubscribers();
  return subscribers.length;
}
