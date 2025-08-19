// src/pages/index.jsx - الصفحة الرئيسية المحدثة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import QuranLoader from '../components/QuranLoader';
// استيراد انتقائي لتحسين الأداء
import { 
  BookOpen, 
  Volume2, 
  FileText, 
  Radio, 
  Search, 
  Zap, 
  BookMarked, 
  Sparkles, 
  Book, 
  Mic, 
  ArrowLeft 
} from 'lucide-react';

/**
 * الصفحة الرئيسية المحدثة باستخدام النظام الجديد
 * تدعم التصميم المتجاوب وتستخدم CSS المتغيرات
 */
const HomePage = () => {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // تأكد من تحميل المكون قبل العرض
  useEffect(() => {
    setMounted(true);

    // إخفاء loader بعد تحميل الصفحة
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // قائمة الصور للعرض المتناوب
  const heroImages = [
    {
      src: 'alf.gif',
      alt: 'القرآن الكريم - التلاوة المباركة',
      title: 'تلاوة القرآن الكريم'
    },
    {
      src: 'img/hero1.png',
      alt: 'المصحف الشريف',
      title: 'المصحف الشريف'
    },
    {
      src: 'img/hero.png',
      alt: 'الاستماع للقرآن',
      title: 'الاستماع للقرآن',
    
    }
  ];

  // تبديل الصور تلقائياً
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 
    10000); // تغيير كل 5 ثواني

    return () => clearInterval(interval);
  }, [mounted, heroImages.length]);

  // الميزات الرئيسية للموقع
  const features = [
    {
      icon: BookOpen,
      title: 'تصفح المصحف',
      description: 'تصفح القرآن الكريم صفحة بصفحة بتصميم جميل وواضح',
      href: '/quran-pages/1',
      color: '#34495e'
    },
    {
      icon: Volume2,
      title: 'الصوتيات',
      description: 'استمع للقرآن الكريم بأصوات أشهر القراء',
      href: '/quran-sound',
      color: '#27ae60'
    },
    {
      icon: FileText,
      title: 'المصحف PDF',
      description: 'حمل المصحف الشريف بصيغة PDF لتصفحه في أي وقت',
      href: '/quran-pdf',
      color: '#f39c12'
    },
    {
      icon: Radio,
      title: 'الإذاعة المباشرة',
      description: 'استمع للبث المباشر من إذاعة القرآن الكريم',
      href: '/live',
      color: '#e74c3c'
    },
    {
      icon: Search,
      title: 'البحث في القرآن',
      description: 'ابحث في آيات القرآن الكريم بسهولة ويسر',
      href: '/search',
      color: '#3498db'
    },
    {
      icon: Zap,
      title: 'API للمطورين',
      description: 'استخدم API القرآن الكريم في تطبيقاتك',
      href: 'https://quran-api-qklj.onrender.com/docs',
      color: '#9b59b6'
    }
  ];

  // إحصائيات الموقع
  const stats = [
    { number: '114', label: 'سورة', icon: BookMarked },
    { number: '6236', label: 'آية', icon: Sparkles },
    { number: '30', label: 'جزء', icon: Book },
    { number: '153', label: 'قارئ', icon: Mic }
  ];

  // عرض loader بسيط أثناء التحميل
  if (!mounted || isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#fafafa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        opacity: isLoading ? 1 : 0,
        transition: 'opacity 0.5s ease-out'
      }}>
        <QuranLoader
          size={80}
          text="مرحباً بك في موقع القرآن الكريم..."
          showText={true}
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>القرآن الكريم - القرآن الإلكتروني</title>
        <meta name="description" content="موقع شامل لتلاوة وتصفح واستماع القرآن الكريم بأفضل جودة وأسهل طريقة." />
        <meta name="keywords" content="القرآن الكريم, تلاوة القرآن, تصفح القرآن, استماع القرآن, القرآن الإلكتروني, القرآن الكريم الإلكتروني" />
      </Head> 

      <div className="homepage" style={{
        opacity: mounted && !isLoading ? 1 : 0,
        transition: 'opacity 0.8s ease-in-out'
      }}>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-background">
            <div className="hero-image-container">
              <Image
                src={heroImages[currentImageIndex].src}
                alt={heroImages[currentImageIndex].alt}
                fill
                style={{ objectFit: 'cover' }}
                priority
                quality={90}
              />
            </div>
            <div className="hero-overlay"></div>
          </div>
          
          <div className="hero-content">
            <h1 className="hero-title">
         بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ 
            </h1>
            <h2 className="hero-subtitle">
              
            </h2>
            <p className="hero-description">

              {heroImages[currentImageIndex].title}
            </p>
   
            
            <div className="hero-actions">
              <Link href="/quran-pages/1" className="btn btn-primary hero-btn">
                ابدأ التصفح
              </Link>
              <Link href="/quran-sound" className="btn btn-secondary hero-btn">
                استمع الآن
              </Link>
            </div>
          </div>

          {/* مؤشرات الصور */}
          <div className="hero-indicators">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`صورة ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* الإحصائيات */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="stat-card">
                    <div className="stat-icon">
                      <IconComponent size={40} strokeWidth={1.5} />
                    </div>
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* الميزات الرئيسية */}
        <section className="features-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">ميزات الموقع</h2>
              <p className="section-description">
                اكتشف جميع الخدمات التي يوفرها موقع القرآن الكريم
              </p>
            </div>
            
            <div className="features-grid">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Link key={index} href={feature.href} className="feature-card">
                    <div className="feature-icon" style={{ color: feature.color }}>
                      <IconComponent size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                    <div className="feature-arrow">
                      <ArrowLeft size={20} strokeWidth={2} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* قسم الدعوة للعمل */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">ابدأ رحلتك مع القرآن الكريم</h2>
              <p className="cta-description">
                انضم إلى الملايين الذين يستخدمون موقعنا لتلاوة وتصفح القرآن الكريم
              </p>
              <div className="cta-actions">
                <Link href="/quran-pages/1" className="btn btn-primary cta-btn">
                  ابدأ الآن
                </Link>
                <Link href="/about" className="btn btn-secondary cta-btn">
                  اعرف المزيد
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* أنماط الصفحة الرئيسية */}
      <style jsx>{`
        .homepage {
          width: 100%;
          min-height: 100vh;
          background-color: var(--background-color);
        }

        /* Hero Section - محسن للاستجابة */
        .hero {
          position: relative;
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          overflow: hidden;
          border-radius: 12px;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
        }

        .hero-image-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          z-index: 2;
        }

        .hero-content {
          position: absolute;
          bottom: 80px;
          right: 40px;
          z-index: 3;
          text-align: center;
          color: white;
          width: 350px;
          max-width: 90vw;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 16px;
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .hero-title {
          font-size: clamp(1.2rem, 2.5vw, 1.8rem);
          font-weight: 600;
          margin-bottom: 0.8rem;
          font-family: var(--font-family-arabic);
          text-shadow: 2px 2px 8px rgba(22, 22, 22, 0.9);
          color: #e0e1dd;
          line-height: 1.4;
        }

        .hero-subtitle {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 600;
          margin-bottom: var(--spacing-lg);
          font-family: var(--font-family-arabic);
          color: #ffffff;
          text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
          opacity: 0.95;
        }

        .hero-description {
          font-size: clamp(0.9rem, 1.8vw, 1.1rem);
          line-height: 1.6;
          margin-bottom: 1.2rem;
          font-family: var(--font-family-arabic);
          color: #ffffff;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
          opacity: 0.95;
        }

        .hero-actions {
          display: flex;
          gap: 0.8rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-btn {
          padding: 0.7rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 8px;
          transition: all var(--transition-base);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          box-shadow: var(--shadow-lg);
        }

        .hero-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-xl);
        }

        .hero-indicators {
          position: absolute;
          bottom: var(--spacing-2xl);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: var(--spacing-sm);
          z-index: 4;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: var(--border-radius-full);
          border: 2px solid white;
          background: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .indicator.active {
          background: white;
        }

        .indicator:hover {
          background: rgba(255, 255, 255, 0.7);
        }

        /* Stats Section */
        .stats-section {
          padding: var(--spacing-3xl) 0;
          background: var(--background-paper);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-xl);
          border-radius: var(--border-radius-xl);
          transition: all var(--transition-base);
        
        }

        .stat-card {
          text-align: center;
          padding: var(--spacing-xl);
          background: var(--background-color);
          border-radius: var(--border-radius-xl);
          border: 7px solid rgba( 11, 55, 22, 0.2);
          box-shadow: var(--shadow-md);
          transition: all var(--transition-base);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.2);
          color: var(--primary-dark);
        }

        .stat-icon {
          margin-bottom: var(--spacing-md);
          color: #96ae73ff;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all var(--transition-base);
        }

        .stat-number {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: var(--spacing-sm);
        }

        .stat-label {
          font-size: clamp(1.2rem, 3vw, 5rem);
          color: var(--text-secondary);
          font-family: var(--font-family-arabic);
        }

        /* Features Section */
        .features-section {
          padding: var(--spacing-3xl) 0;
          background: var(--background-color);
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--spacing-3xl);
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
          font-family: var(--font-family-arabic);
        }

        .section-description {
          font-size: var(--font-size-lg);
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          font-family: var(--font-family-arabic);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-xl);
        }

        .feature-card {
          background: var(--background-paper);
          border-radius: var(--border-radius-xl);
          padding: var(--spacing-2xl);
          text-decoration: none;
          color: var(--text-primary);
          transition: all var(--transition-base);
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
          transform: scaleX(0);
          transition: transform var(--transition-base);
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-2xl);
        }

        .feature-card:hover .feature-icon {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .feature-icon {
          margin-bottom: var(--spacing-md);
          display: flex;
          justify-content: center;
          align-items: center;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius-xl);
          transition: all var(--transition-base);
        }

        .feature-title {
          font-size: var(--font-size-xl);
          font-weight: 600;
          margin-bottom: var(--spacing-md);
          font-family: var(--font-family-arabic);
        }

        .feature-description {
          font-size: var(--font-size-base);
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: var(--spacing-lg);
          font-family: var(--font-family-arabic);
        }

        .feature-arrow {
          position: absolute;
          bottom: var(--spacing-lg);
          left: var(--spacing-lg);
          color: var(--primary-color);
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-full);
          background: rgba(52, 73, 94, 0.1);
        }

        .feature-card:hover .feature-arrow {
          transform: translateX(-4px);
          background: rgba(52, 73, 94, 0.2);
        }

        /* CTA Section */
        .cta-section {
          padding: var(--spacing-3xl) 0;
          background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-dark) 100%);
          color: white;
        }

        .cta-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          font-family: var(--font-family-arabic);
        }

        .cta-description {
          font-size: var(--font-size-lg);
          line-height: 1.8;
          margin-bottom: var(--spacing-2xl);
          opacity: 0.9;
          font-family: var(--font-family-arabic);
        }

        .cta-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-btn {
          padding: var(--spacing-md) var(--spacing-2xl);
          font-size: var(--font-size-lg);
          font-weight: 600;
          border-radius: var(--border-radius-xl);
          transition: all var(--transition-base);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          box-shadow: var(--shadow-lg);
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-xl);
        }

        /* Responsive Design - محسن للشاشات الصغيرة */
        @media (max-width: 768px) {
          .hero {
            height: 100vh;
            padding: 0;
          }

          .hero-content {
            width: 95%;
            margin: 0 auto;
            padding: clamp(1rem, 3vw, 1.5rem);
            min-height: auto;
          }

          .hero-title {
            font-size: clamp(1.8rem, 5vw, 2.5rem);
            margin-bottom: 1rem;
          }

          .hero-description {
            font-size: clamp(0.9rem, 3vw, 1.1rem);
            margin-bottom: 1.5rem;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .hero-btn {
            width: 100%;
            max-width: 250px;
            justify-content: center;
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }

          .cta-actions {
            flex-direction: column;
            align-items: center;
          }

          .cta-btn {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .hero-content {
            bottom: 60px;
            right: 20px;
            left: 20px;
            width: auto;
            max-width: calc(100vw - 40px);
            padding: 1.2rem;
          }

          .hero-title {
            font-size: clamp(1rem, 4vw, 1.4rem);
            margin-bottom: 0.6rem;
          }

          .hero-description {
            font-size: clamp(0.8rem, 3vw, 1rem);
            margin-bottom: 1rem;
          }

          .hero-btn {
            padding: 0.6rem 1rem;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .hero-content {
            bottom: 40px;
            right: 15px;
            left: 15px;
            width: auto;
            max-width: calc(100vw - 30px);
            padding: 1rem;
          }

          .hero-title {
            font-size: clamp(0.9rem, 4vw, 1.2rem);
          }

          .hero-actions {
            flex-direction: column;
            gap: 0.6rem;
          }

          .hero-btn {
            width: 100%;
            padding: 0.7rem;
            font-size: 0.85rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .feature-card {
            padding: var(--spacing-lg);
          }
        }

        /* تحسين الأداء */
        .hero {
          will-change: transform;
          contain: layout style paint;
        }

        .feature-card {
          will-change: transform;
          contain: layout style paint;
        }

        /* تحسين للطباعة */
        @media print {
          .hero-background,
          .hero-indicators,
          .cta-section {
            display: none;
          }
          
          .hero {
            height: auto;
            background: white;
            color: black;
          }
        }
      `}</style>
    </>
  );
};

export default HomePage;