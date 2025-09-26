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

// إضافة مشترك جديد أو إعادة تفعيل معطل
export async function addSubscriber(email) {
  try {
    const collection = await connectToDB();
    
    // التحقق من وجود الإيميل مسبقاً
    const existing = await collection.findOne({ email });
    
    if (existing) {
      if (existing.isActive) {
        throw new Error('هذا البريد الإلكتروني مشترك بالفعل');
      } else {
        // إعادة تفعيل حساب معطل
        await collection.updateOne(
          { email },
          { 
            $set: { 
              isActive: true, 
              resubscribedAt: new Date(),
              unsubscribedAt: null 
            } 
          }
        );
        console.log('🔄 تم إعادة تفعيل مشترك:', email);
        return true;
      }
    }
    
    // إضافة مشترك جديد
    const subscriberData = {
      email,
      subscribedAt: new Date(),
      isActive: true,
      source: 'website',
      firstHadithSent: false,
      firstHadithSentAt: null,
      lastDailyHadithSent: null
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

// البحث عن المشتركين الذين لم يتلقوا أول حديث
export async function getPendingFirstHadithSubscribers(secondsAgo = 5) {
  try {
    const collection = await connectToDB();
    const cutoffTime = new Date(Date.now() - (secondsAgo * 1000));
    
    const pendingSubscribers = await collection.find({
      isActive: true,
      $or: [
        { firstHadithSent: false },
        { firstHadithSent: { $exists: false } },
        { firstHadithSent: null }
      ],
      subscribedAt: { $lte: cutoffTime }
    }).toArray();
    
    return pendingSubscribers.map(sub => sub.email);
  } catch (error) {
    console.error('خطأ في البحث عن المشتركين المعلقين:', error);
    return [];
  }
}

// تحديث حالة إرسال أول حديث
export async function markFirstHadithSent(email) {
  try {
    const collection = await connectToDB();
    
    await collection.updateOne(
      { email },
      { 
        $set: { 
          firstHadithSent: true,
          firstHadithSentAt: new Date()
        } 
      }
    );
    
    console.log('✅ تم تحديث حالة أول حديث للمشترك:', email);
    return true;
  } catch (error) {
    console.error('خطأ في تحديث حالة أول حديث:', error);
    return false;
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

// فحص هل تم إرسال الحديث اليومي اليوم
export async function checkTodayHadithSent() {
  try {
    const db = client.db(DB_NAME);
    const dailyTracking = db.collection('daily_hadith_tracking');
    
    const today = new Date().toDateString(); // "Mon Oct 26 2024"
    
    const todayRecord = await dailyTracking.findOne({ 
      date: today,
      sent: true 
    });
    
    return !!todayRecord;
  } catch (error) {
    console.error('خطأ في فحص الإرسال اليومي:', error);
    return false;
  }
}

// تسجيل إرسال الحديث اليومي لليوم
export async function markTodayHadithSent(hadithData) {
  try {
    const db = client.db(DB_NAME);
    const dailyTracking = db.collection('daily_hadith_tracking');
    
    const today = new Date().toDateString();
    
    await dailyTracking.updateOne(
      { date: today },
      { 
        $set: { 
          date: today,
          sent: true,
          sentAt: new Date(),
          hadith: hadithData,
          subscribersCount: hadithData.subscribersCount || 0
        } 
      },
      { upsert: true }
    );
    
    console.log('✅ تم تسجيل إرسال الحديث اليومي:', today);
    return true;
  } catch (error) {
    console.error('خطأ في تسجيل الإرسال اليومي:', error);
    return false;
  }
}

// التحقق من حالة اشتراك البريد الإلكتروني
export async function checkSubscriptionStatus(email) {
  try {
    const collection = await connectToDB();
    const subscriber = await collection.findOne({ email });
    
    if (!subscriber) {
      return { exists: false, isActive: false, status: 'not_found' };
    }
    
    return { 
      exists: true, 
      isActive: subscriber.isActive, 
      status: subscriber.isActive ? 'active' : 'unsubscribed',
      subscribedAt: subscriber.subscribedAt 
    };
  } catch (error) {
    console.error('خطأ في فحص حالة الاشتراك:', error);
    return { exists: false, isActive: false, status: 'error' };
  }
}
