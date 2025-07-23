import { useState, useEffect } from 'react';

/**
 * هوك لعرض لودر دائري متحرك للمحتوى الداخلي
 * يمكنك استخدامه في أي مكون هكذا:
 * const { loading, Loader } = useAsyncLoading(isLoading);
 */
export function useAsyncLoading(isLoading, minLoadingTime = 1500) {
  const [loading, setLoading] = useState(isLoading);
  const [showLoader, setShowLoader] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      setShowLoader(true);
    } else {
      // تأخير إخفاء اللودر لضمان التحميل السلس
      const timer = setTimeout(() => {
        setLoading(false);
        setShowLoader(false);
      }, minLoadingTime);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minLoadingTime]);

  // مكون اللودر الدائري المحسن
  const Loader = ({ text = "جاري التحميل..." }) => (
    showLoader && (
      <div className="content-loader-overlay">
        <div className="content-loader-container">
          <div className="loader"></div>
          <p className="loader-text">{text}</p>
        </div>
      </div>
    )
  );

  return { loading, Loader, showLoader };
}