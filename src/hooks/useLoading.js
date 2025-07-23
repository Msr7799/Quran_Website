// src/hooks/useLoading.js - Hook لإدارة حالات التحميل

import { useState, useEffect } from 'react';

/**
 * Hook لإدارة حالات التحميل مع تأخير اختياري
 * @param {number} minLoadingTime - الحد الأدنى لوقت التحميل بالميلي ثانية
 * @returns {object} - كائن يحتوي على حالة التحميل والدوال للتحكم بها
 */
export const useLoading = (minLoadingTime = 1000) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);

  const startLoading = () => {
    setIsLoading(true);
    setLoadingStartTime(Date.now());
  };

  const stopLoading = () => {
    if (loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStartTime(null);
      }, remainingTime);
    } else {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    startLoading,
    stopLoading
  };
};

/**
 * Hook للتحميل التلقائي عند تحميل المكون
 * @param {Function} loadFunction - دالة التحميل
 * @param {Array} dependencies - المتغيرات التي تؤثر على التحميل
 * @param {number} minLoadingTime - الحد الأدنى لوقت التحميل
 * @returns {object} - حالة التحميل والبيانات والأخطاء
 */
export const useAsyncLoading = (loadFunction, dependencies = [], minLoadingTime = 1000) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await loadFunction();
        
        if (isMounted) {
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
          
          setTimeout(() => {
            if (isMounted) {
              setData(result);
              setIsLoading(false);
            }
          }, remainingTime);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { isLoading, data, error };
};

/**
 * Hook لإدارة التحميل مع إظهار تدريجي للمحتوى
 * @param {number} staggerDelay - التأخير بين العناصر بالميلي ثانية
 * @returns {object} - دوال للتحكم في الإظهار التدريجي
 */
export const useStaggeredLoading = (staggerDelay = 100) => {
  const [visibleItems, setVisibleItems] = useState(new Set());

  const showItem = (index) => {
    setTimeout(() => {
      setVisibleItems(prev => new Set([...prev, index]));
    }, index * staggerDelay);
  };

  const showItems = (count) => {
    for (let i = 0; i < count; i++) {
      showItem(i);
    }
  };

  const isItemVisible = (index) => visibleItems.has(index);

  const reset = () => setVisibleItems(new Set());

  return {
    showItem,
    showItems,
    isItemVisible,
    reset
  };
};

export default useLoading;
