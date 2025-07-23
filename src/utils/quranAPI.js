// مكتبة للاتصال المباشر بـ mp3quran.net API
const BASE_URL = 'https://mp3quran.net/api/v3';

// دالة مساعدة للتعامل مع CORS
const fetchWithCORS = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    // إذا فشل CORS، نحاول استخدام proxy عام
    console.warn('Direct API call failed, trying with proxy:', error.message);
    
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyUrl);
    
    if (!proxyResponse.ok) {
      throw new Error(`Proxy request failed: ${proxyResponse.status}`);
    }
    
    const proxyData = await proxyResponse.json();
    
    // إنشاء response object مشابه
    return {
      ok: true,
      json: async () => JSON.parse(proxyData.contents),
      text: async () => proxyData.contents
    };
  }
};

// جلب القراء الذين لديهم توقيت
export const fetchReads = async () => {
  try {
    // محاولة جلب البيانات المحلية أولاً
    const localResponse = await fetch('/json/local_reciters.json');
    if (localResponse.ok) {
      console.log('✅ تم جلب القراء من البيانات المحلية');
      return await localResponse.json();
    }
  } catch (localError) {
    console.warn('❌ فشل في جلب البيانات المحلية، محاولة الـ API الخارجي...');
  }

  try {
    const response = await fetchWithCORS(`${BASE_URL}/ayat_timing/reads`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching reads:', error);
    // إرجاع بيانات افتراضية
    return [
      {
        id: 1,
        name: "عبد الرحمن السديس",
        rewaya: "حفص عن عاصم",
        folder_url: "https://server11.mp3quran.net/sds/",
        server: "https://server11.mp3quran.net/sds"
      }
    ];
  }
};

// جلب السور لقارئ محدد
export const fetchSurahs = async (readId) => {
  try {
    // محاولة جلب البيانات المحلية أولاً
    const localResponse = await fetch('/json/local_surahs.json');
    if (localResponse.ok) {
      console.log('✅ تم جلب السور من البيانات المحلية');
      return await localResponse.json();
    }
  } catch (localError) {
    console.warn('❌ فشل في جلب السور المحلية، محاولة الـ API الخارجي...');
  }

  try {
    const response = await fetchWithCORS(`${BASE_URL}/ayat_timing/soar?read=${readId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching surahs:', error);
    // إرجاع بيانات افتراضية
    return [
      {"id": 1, "name": "الفاتحة", "verses_count": 7},
      {"id": 2, "name": "البقرة", "verses_count": 286},
      {"id": 18, "name": "الكهف", "verses_count": 110}
    ];
  }
};

// جلب توقيتات الآيات مباشرة من API
export const fetchAyatTiming = async (surahId, readId) => {
  console.log(`🎵 جلب توقيتات السورة ${surahId} للقارئ ${readId}`);

  try {
    const response = await fetchWithCORS(`${BASE_URL}/ayat_timing?surah=${surahId}&read=${readId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const timingData = await response.json();
    console.log(`✅ تم جلب ${timingData.length} توقيت للسورة ${surahId}`);

    // التحقق من صحة البيانات
    if (validateTimingData(timingData)) {
      return timingData;
    } else {
      console.warn('⚠️ بيانات التوقيت غير صحيحة، استخدام البيانات التجريبية');
      return SAMPLE_TIMING_DATA;
    }
  } catch (error) {
    console.error('❌ خطأ في جلب توقيتات الآيات:', error);
    // إرجاع بيانات تجريبية
    return SAMPLE_TIMING_DATA;
  }
};

// جلب صفحة SVG مع طرق متعددة
export const fetchSVGPage = async (pageNumber) => {
  const pageNum = pageNumber.toString().padStart(3, '0');
  const svgUrl = `https://www.mp3quran.net/api/quran_pages_svg/${pageNum}.svg`;

  console.log(`🔍 محاولة جلب SVG للصفحة ${pageNum} من:`, svgUrl);

  // الطريقة 1: جلب مباشر مع headers محسنة
  try {
    const response = await fetch(svgUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'image/svg+xml, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://mp3quran.net/',
        'Origin': 'https://mp3quran.net'
      },
      credentials: 'omit'
    });

    if (response.ok) {
      const svgContent = await response.text();

      if (svgContent && svgContent.includes('<svg') && svgContent.includes('</svg>')) {
        console.log('✅ تم جلب SVG بنجاح (طريقة مباشرة)');
        return svgContent;
      }
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  } catch (error) {
    console.warn('❌ فشل الجلب المباشر:', error.message);
  }

  // الطريقة 2: استخدام proxy
  try {
    console.log('🔄 محاولة مع proxy...');
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(svgUrl)}`;

    const proxyResponse = await fetch(proxyUrl);
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();

      if (proxyData.contents && proxyData.contents.includes('<svg')) {
        console.log('✅ تم جلب SVG بنجاح (عبر proxy)');
        return proxyData.contents;
      }
    }
  } catch (proxyError) {
    console.warn('❌ فشل proxy أيضاً:', proxyError.message);
  }

  // الطريقة 3: استخدام JSONP أو iframe (للمتصفحات)
  if (typeof window !== 'undefined') {
    try {
      console.log('🌐 محاولة مع iframe...');
      const svgContent = await fetchSVGViaIframe(svgUrl);
      if (svgContent) {
        console.log('✅ تم جلب SVG بنجاح (عبر iframe)');
        return svgContent;
      }
    } catch (iframeError) {
      console.warn('❌ فشل iframe:', iframeError.message);
    }
  }

  // الطريقة 4: استخدام الصفحة المحلية التجريبية
  try {
    console.log('📁 محاولة استخدام الصفحة المحلية...');
    const localResponse = await fetch('/sample-quran-page.svg');
    if (localResponse.ok) {
      const localContent = await localResponse.text();
      console.log('✅ تم استخدام الصفحة المحلية');
      return localContent;
    }
  } catch (localError) {
    console.warn('❌ فشل في الصفحة المحلية:', localError.message);
  }

  // الطريقة 5: إنشاء SVG بسيط كـ fallback أخير
  console.log('🔧 إنشاء SVG بديل...');
  return createFallbackSVG(pageNumber);
};

// جلب SVG عبر iframe (للمتصفحات فقط)
const fetchSVGViaIframe = (url) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('iframe method only works in browser'));
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';

    const timeout = setTimeout(() => {
      document.body.removeChild(iframe);
      reject(new Error('iframe timeout'));
    }, 10000);

    iframe.onload = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const svgElement = iframeDoc.querySelector('svg');

        if (svgElement) {
          const svgContent = new XMLSerializer().serializeToString(svgElement);
          clearTimeout(timeout);
          document.body.removeChild(iframe);
          resolve(svgContent);
        } else {
          throw new Error('No SVG found in iframe');
        }
      } catch (error) {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        reject(error);
      }
    };

    iframe.onerror = () => {
      clearTimeout(timeout);
      document.body.removeChild(iframe);
      reject(new Error('iframe load error'));
    };

    iframe.src = url;
    document.body.appendChild(iframe);
  });
};

// إنشاء SVG بسيط كـ fallback
const createFallbackSVG = (pageNumber) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="800" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="800" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
  <rect x="50" y="50" width="500" height="700" fill="white" stroke="#6c757d" stroke-width="1"/>

  <!-- عنوان الصفحة -->
  <text x="300" y="150" text-anchor="middle" font-family="Arial" font-size="28" font-weight="bold" fill="#333">
    صفحة ${pageNumber}
  </text>

  <!-- رسالة عدم التوفر -->
  <text x="300" y="300" text-anchor="middle" font-family="Arial" font-size="18" fill="#666">
    لم يتم تحميل المحتوى من الخادم
  </text>

  <text x="300" y="350" text-anchor="middle" font-family="Arial" font-size="16" fill="#999">
    يرجى التحقق من الاتصال بالإنترنت
  </text>

  <!-- نص تجريبي -->
  <text x="450" y="450" text-anchor="end" font-family="Arial" font-size="20" fill="#333">
    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
  </text>

  <text x="450" y="490" text-anchor="end" font-family="Arial" font-size="18" fill="#333">
    الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
  </text>

  <!-- مناطق تظليل تجريبية -->
  <polygon id="ayah-1" points="200,430 450,430 450,460 200,460"
           fill="transparent" stroke="transparent"/>

  <polygon id="ayah-2" points="200,470 450,470 450,500 200,500"
           fill="transparent" stroke="transparent"/>

  <!-- إطار الصفحة -->
  <rect x="80" y="120" width="440" height="600" fill="none" stroke="#ddd" stroke-width="1"/>

  <!-- معلومات إضافية -->
  <text x="300" y="750" text-anchor="middle" font-family="Arial" font-size="12" fill="#aaa">
    صفحة بديلة - للاختبار فقط
  </text>
</svg>`;
};

// دالة للتحقق من صحة SVG
export const validateSVGContent = (content) => {
  if (!content || typeof content !== 'string') return false;

  // التحقق من وجود عناصر SVG الأساسية
  const hasOpenTag = content.includes('<svg');
  const hasCloseTag = content.includes('</svg>');
  const hasValidStructure = content.includes('viewBox') || content.includes('width');

  return hasOpenTag && hasCloseTag && hasValidStructure;
};

// دالة لتنظيف محتوى SVG
export const cleanSVGContent = (content) => {
  if (!content) return content;

  // إزالة XML declaration إذا كان موجود
  let cleaned = content.replace(/<\?xml[^>]*\?>/i, '').trim();

  // إضافة attributes مفيدة للـ SVG
  if (cleaned.includes('<svg') && !cleaned.includes('style=')) {
    cleaned = cleaned.replace(
      '<svg',
      '<svg style="width: 100%; height: 100%; max-width: 100%; max-height: 100%;"'
    );
  }

  return cleaned;
};

// دالة للحصول على رابط الصوت
export const getAudioUrl = (readData, surahNumber) => {
  if (!readData || !readData.folder_url) return null;
  
  const surahNum = surahNumber.toString().padStart(3, '0');
  return `${readData.folder_url}${surahNum}.mp3`;
};

// دالة للتحقق من صحة البيانات
export const validateTimingData = (timingData) => {
  if (!Array.isArray(timingData)) return false;
  
  return timingData.every(timing => 
    typeof timing.ayah === 'number' &&
    typeof timing.start_time === 'number' &&
    typeof timing.end_time === 'number'
  );
};

// دالة لتنظيف بيانات السور
export const cleanSurahData = (surahs) => {
  return surahs.map(surah => ({
    ...surah,
    name: surah.name ? surah.name.trim().replace(/\r\n/g, '') : `سورة ${surah.id}`
  }));
};

// دالة للبحث عن الآية الحالية حسب الوقت
export const findCurrentAyah = (timingData, currentTimeMs) => {
  if (!timingData || timingData.length === 0) return null;
  
  // البحث عن الآية الحالية
  const currentAyah = timingData.find(timing => 
    timing.ayah > 0 && // تجاهل الآية 0
    currentTimeMs >= timing.start_time && 
    currentTimeMs <= timing.end_time
  );
  
  if (currentAyah) return currentAyah;
  
  // إذا لم نجد آية دقيقة، ابحث عن أقرب آية
  const validTimings = timingData.filter(timing => timing.ayah > 0);
  
  if (validTimings.length === 0) return null;
  
  return validTimings.reduce((closest, timing) => {
    const timingDistance = Math.abs(currentTimeMs - timing.start_time);
    const closestDistance = closest ? Math.abs(currentTimeMs - closest.start_time) : Infinity;
    
    return timingDistance < closestDistance ? timing : closest;
  }, null);
};

// دالة لتحويل الوقت من ثواني إلى ميلي ثانية
export const secondsToMs = (seconds) => seconds * 1000;

// دالة لتحويل الوقت من ميلي ثانية إلى ثواني
export const msToSeconds = (ms) => ms / 1000;

// دالة لتنسيق الوقت للعرض
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// دالة للتحقق من دعم المتصفح للصوت
export const checkAudioSupport = () => {
  const audio = document.createElement('audio');
  return {
    mp3: audio.canPlayType('audio/mpeg') !== '',
    ogg: audio.canPlayType('audio/ogg') !== '',
    wav: audio.canPlayType('audio/wav') !== ''
  };
};

// دالة لإنشاء URL آمن للصوت
export const createSafeAudioUrl = (url) => {
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
};

// بيانات تجريبية للاختبار
export const SAMPLE_TIMING_DATA = [
  {
    ayah: 0,
    polygon: null,
    start_time: 0,
    end_time: 5587,
    x: null,
    y: null,
    page: null
  },
  {
    ayah: 1,
    polygon: "206.48,46.08 172.36,46.08 172.36,72.23 206.48,72.23",
    start_time: 5587,
    end_time: 12658,
    x: "178.34",
    y: "63.11",
    page: "https://www.mp3quran.net/api/quran_pages_svg/002.svg"
  },
  {
    ayah: 2,
    polygon: "172.36,46.08 33.75,46.08 33.75,72.23 225.78,72.36 225.78,102.49 172.36,102.49 172.36,71.98 172.36,72.23",
    start_time: 12658,
    end_time: 19150,
    x: "178.90",
    y: "91.95",
    page: "https://www.mp3quran.net/api/quran_pages_svg/002.svg"
  },
  {
    ayah: 3,
    polygon: "172.36,72.23 12.08,72.23 12.08,101.66 113.95,101.66 113.95,133.88 228.16,133.88 228.16,103.66 172.36,103.66 172.36,72.36",
    start_time: 19150,
    end_time: 29219,
    x: "120.74",
    y: "119.66",
    page: "https://www.mp3quran.net/api/quran_pages_svg/002.svg"
  },
  {
    ayah: 4,
    polygon: "113.95,101.66 11.46,101.66 11.46,160.15 228.52,160.15 228.52,133.63 113.95,133.63 113.95,101.66",
    start_time: 29219,
    end_time: 42210,
    x: "22.41",
    y: "147.58",
    page: "https://www.mp3quran.net/api/quran_pages_svg/002.svg"
  }
];

export default {
  fetchReads,
  fetchSurahs,
  fetchAyatTiming,
  fetchSVGPage,
  getAudioUrl,
  validateTimingData,
  cleanSurahData,
  findCurrentAyah,
  formatTime,
  checkAudioSupport,
  createSafeAudioUrl,
  SAMPLE_TIMING_DATA
};
