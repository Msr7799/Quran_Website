import { useState } from 'react';
import Head from 'next/head';

export default function TestHadith() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTestSend = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-daily-hadith', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'حدث خطأ غير معروف');
      }
    } catch (err) {
      setError('فشل في الاتصال بالخادم: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduledSend = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/cron/daily-hadith', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'حدث خطأ غير معروف');
      }
    } catch (err) {
      setError('فشل في الاتصال بالخادم: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Head>
        <title>اختبار نظام الحديث اليومي</title>
      </Head>
      
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🧪 اختبار نظام الحديث اليومي</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
        <button
          onClick={handleTestSend}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? '⏳ جاري الإرسال...' : '📧 اختبار الإرسال (بدون قيود وقت)'}
        </button>
        
        <button
          onClick={handleScheduledSend}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? '⏳ جاري التحقق...' : '⏰ اختبار النظام المجدول'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <strong>❌ خطأ:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          padding: '20px',
          backgroundColor: result.ok ? '#d4edda' : '#f8d7da',
          color: result.ok ? '#155724' : '#721c24',
          border: `1px solid ${result.ok ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>{result.ok ? '✅ نجح' : '❌ فشل'}:</strong> {result.message}
          </div>
          
          {result.stats && (
            <div style={{ marginBottom: '15px' }}>
              <h3>📊 الإحصائيات:</h3>
              <ul style={{ margin: 0 }}>
                <li>إجمالي المشتركين: {result.stats.total}</li>
                <li>نجح الإرسال: {result.stats.successful}</li>
                <li>فشل الإرسال: {result.stats.failed}</li>
                <li>التوقيت: {result.stats.timestamp}</li>
                {result.stats.testMode && <li style={{ color: '#ffc107' }}>🧪 وضع الاختبار</li>}
              </ul>
            </div>
          )}
          
          {result.hadith && (
            <div>
              <h3>📖 الحديث المُرسل:</h3>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.1)',
                padding: '15px',
                borderRadius: '5px',
                fontSize: '14px'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>النص:</strong> {result.hadith.text}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>المصدر:</strong> {result.hadith.source}
                </div>
                <div>
                  <strong>الراوي:</strong> {result.hadith.narrator}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{
        padding: '20px',
        backgroundColor: '#e2e3e5',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h3>ℹ️ معلومات:</h3>
        <ul style={{ margin: 0 }}>
          <li><strong>الاختبار بدون قيود:</strong> يرسل الحديث فوراً بغض النظر عن الوقت</li>
          <li><strong>النظام المجدول:</strong> يتحقق من الوقت (بين 6-7 مساءً بتوقيت البحرين)</li>
          <li><strong>Vercel Cron:</strong> سيعمل تلقائياً في البرودكشن يومياً الساعة 7 مساءً</li>
        </ul>
      </div>
    </div>
  );
}
