// Patched scheduled/daily-hadith.js
// This version is defensive about the return value of sendDailyHadithToAll
// and logs clear diagnostics so you can see why "e is not iterable" happened.

import { getSubscribers, checkTodayHadithSent, markTodayHadithSent } from '../../../utils/mongoDataStorage.js';
import { sendDailyHadithToAll } from '../../../utils/emailSender.js';
import hadithReader from '../../../utils/hadithDataReader.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    console.log('[daily-hadith] start process');

    // 1. Check if already sent today
    const already = await checkTodayHadithSent();
    console.log('[daily-hadith] checkTodayHadithSent ->', { already });
    if (already) {
      return res.status(200).json({ ok: true, message: 'Daily hadith already sent today' });
    }

    // 2. Get subscribers
    const subscribers = await getSubscribers();
    console.log('[daily-hadith] subscribers count ->', Array.isArray(subscribers) ? subscribers.length : typeof subscribers);

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      console.log('[daily-hadith] no subscribers to send to');
      return res.status(200).json({ ok: true, message: 'No subscribers' });
    }

    // 3. Get a hadith (prefer mongo fallback to local file implemented in hadithReader)
    let hadith;
    try {
      hadith = await hadithReader.getRandomHadith?.() || null;
    } catch (err) {
      console.error('[daily-hadith] hadithReader.getRandomHadith threw:', err);
      hadith = null;
    }
    if (!hadith) {
      console.error('[daily-hadith] no hadith available to send');
      return res.status(500).json({ ok: false, message: 'No hadith available' });
    }
    console.log('[daily-hadith] selected hadith ->', { book: hadith.book || hadith.source, id: hadith.id || hadith._id || null });

    // 4. Send emails; sendDailyHadithToAll may return an object { total, success, failed }
    //    or an array/result; handle both shapes safely.
    let sendResult;
    try {
      sendResult = await sendDailyHadithToAll(subscribers, hadith);
      console.log('[daily-hadith] raw send result type:', typeof sendResult);
    } catch (err) {
      console.error('[daily-hadith] sendDailyHadithToAll threw:', err);
      return res.status(500).json({ ok: false, message: 'Sending emails failed', error: err.message || String(err) });
    }

    // Normalize sendResult into a stats object
    let stats = { total: 0, success: 0, failed: 0, details: null };
    if (Array.isArray(sendResult)) {
      stats.total = sendResult.length;
      stats.success = sendResult.filter(r => r && r.ok).length;
      stats.failed = stats.total - stats.success;
      stats.details = sendResult;
    } else if (sendResult && typeof sendResult === 'object') {
      // commonly: { total, success, failed, errors }
      stats.total = Number(sendResult.total || sendResult.sent || subscribers.length) || subscribers.length;
      stats.success = Number(sendResult.success || sendResult.sentSuccessfully || 0);
      stats.failed = Number(sendResult.failed || (stats.total - stats.success) || 0);
      stats.details = sendResult;
    } else {
      // unexpected type
      stats.total = Array.isArray(subscribers) ? subscribers.length : 0;
      stats.details = sendResult;
    }

    console.log('[daily-hadith] normalized stats ->', stats);

    // 5. Mark as sent in DB with sentAt and hadith meta
    try {
      await markTodayHadithSent({
        date: new Date().toISOString(),
        sent: true,
        sentAt: new Date(),
        hadithMeta: { id: hadith.id || hadith._id || null, book: hadith.book || hadith.source || null, textSnippet: (hadith.hadithText || '').substring(0,120) },
        subscribersCount: stats.total,
        stats
      });
    } catch (err) {
      console.error('[daily-hadith] markTodayHadithSent failed:', err);
      // don't fail the whole request for DB tracking failure; return success but warn
      return res.status(200).json({ ok: true, message: 'Sent but tracking failed', stats, trackError: err.message || String(err) });
    }

    return res.status(200).json({ ok: true, message: 'Daily hadith sent', stats });
  } catch (error) {
    console.error('❌ خطأ في الإرسال اليومي الذكي:', error);
    return res.status(500).json({
      ok: false,
      message: 'حدث خطأ أثناء الإرسال اليومي الذكي',
      error: error && error.message ? error.message : String(error)
    });
  }
}
