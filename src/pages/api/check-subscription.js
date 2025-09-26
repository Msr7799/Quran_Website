// API للتحقق من حالة الاشتراك
import { checkSubscriptionStatus } from '../../utils/mongoDataStorage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        ok: false, 
        message: 'البريد الإلكتروني مطلوب' 
      });
    }

    const status = await checkSubscriptionStatus(email.trim().toLowerCase());
    
    return res.status(200).json({ 
      ok: true,
      subscription: status
    });
  } catch (error) {
    console.error('خطأ في فحص حالة الاشتراك:', error);
    return res.status(500).json({ 
      ok: false, 
      message: 'حدث خطأ في فحص حالة الاشتراك' 
    });
  }
}
