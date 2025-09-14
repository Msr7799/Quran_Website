// حل بديل باستخدام MongoDB (الأفضل للإنتاج)
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'quran_newsletter';
const COLLECTION_NAME = 'subscribers';

let client;
let db;

async function connectToDB() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
  }
  return db.collection(COLLECTION_NAME);
}

// إضافة دالة connectToDatabase للتوافق مع API routes الأخرى
export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
  }
  return { db };
}

// قراءة المشتركين
export async function getSubscribers() {
  try {
    const collection = await connectToDB();
    const subscribers = await collection.find({ isActive: true }).toArray();
    return subscribers.map(sub => sub.email);
  } catch (error) {
    console.error('خطأ في قراءة المشتركين من MongoDB:', error);
    return [];
  }
}

// إضافة مشترك جديد
export async function addSubscriber(email) {
  try {
    const collection = await connectToDB();
    
    // التحقق من عدم وجود الإيميل مسبقاً
    const existing = await collection.findOne({ email });
    if (existing) {
      throw new Error('هذا البريد الإلكتروني مشترك بالفعل');
    }
    
    const subscriberData = {
      email,
      subscribedAt: new Date(),
      isActive: true,
      source: 'website'
    };
    
    await collection.insertOne(subscriberData);
    
    console.log('📧 تمت إضافة مشترك جديد:', email);
    return true;
  } catch (error) {
    console.error('خطأ في إضافة المشترك:', error);
    throw error;
  }
}

// حذف مشترك (تعطيل بدلاً من حذف نهائي)
export async function removeSubscriber(email) {
  try {
    const collection = await connectToDB();
    
    await collection.updateOne(
      { email },
      { 
        $set: { 
          isActive: false, 
          unsubscribedAt: new Date() 
        } 
      }
    );
    
    console.log('🗑️ تم إلغاء اشتراك:', email);
    return true;
  } catch (error) {
    console.error('خطأ في حذف المشترك:', error);
    throw error;
  }
}

// عدد المشتركين النشطين
export async function getSubscribersCount() {
  try {
    const collection = await connectToDB();
    return await collection.countDocuments({ isActive: true });
  } catch (error) {
    console.error('خطأ في عد المشتركين:', error);
    return 0;
  }
}
