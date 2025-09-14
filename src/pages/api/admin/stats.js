import { getSubscribersCount, getSubscribers } from '../../../utils/mongoDataStorage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      ok: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const count = await getSubscribersCount();
    const subscribers = await getSubscribers();
    
    // إخفاء جزء من الإيميلات للخصوصية
    const maskedSubscribers = subscribers.map(email => {
      const [username, domain] = email.split('@');
      const maskedUsername = username.length > 2 
        ? username.substring(0, 2) + '*'.repeat(username.length - 2)
        : username;
      return `${maskedUsername}@${domain}`;
    });

    return res.status(200).json({
      ok: true,
      stats: {
        totalSubscribers: count,
        subscribers: maskedSubscribers,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات:', error);
    return res.status(500).json({
      ok: false,
      message: 'خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
}
