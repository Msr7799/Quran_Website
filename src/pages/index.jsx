// src/pages/index.jsx - الصفحة الرئيسية المحدثة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

/**
 * الصفحة الرئيسية المحدثة باستخدام النظام الجديد
 * تدعم التصميم المتجاوب وتستخدم CSS المتغيرات
 */
const HomePage = () => {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // تأكد من تحميل المكون قبل العرض
  useEffect(() => {
    setMounted(true);
  }, []);

  // قائمة الصور للعرض المتناوب
  const heroImages = [
    {
      src: '/images/hero-1.jpg',
      alt: 'القرآن الكريم - التلاوة المباركة',
      title: 'تلاوة القرآن الكريم'
    },
    {
      src: '/images/hero-2.jpg',
      alt: 'المصحف الشريف',
      title: 'المصحف الشريف'
    },
    {
      src: '/images/hero-3.jpg',
      alt: 'الاستماع للقرآن',
      title: 'الاستماع للقرآن'
    }
  ];

  // تبديل الصور تلقائياً
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 5000); // تغيير كل 5 ثواني

    return () => clearInterval(interval);
  }, [mounted, heroImages.length]);

  // الميزات الرئيسية للموقع
  const features = [
    {
      icon: '📖',
      title: 'تصفح المصحف',
      description: 'تصفح القرآن الكريم صفحة بصفحة بتصميم جميل وواضح',
      href: '/quran-pages/1',
      color: 'var(--primary-color)'
    },
    {
      icon: '🎵',
      title: 'الصوتيات',
      description: 'استمع للقرآن الكريم بأصوات أشهر القراء',
      href: '/quran-sound',
      color: 'var(--success-color)'
    },
    {
      icon: '📄',
      title: 'المصحف PDF',
      description: 'حمل المصحف الشريف بصيغة PDF لتصفحه في أي وقت',
      href: '/quran-pdf',
      color: 'var(--warning-color)'
    },
    {
      icon: '📻',
      title: 'الإذاعة المباشرة',
      description: 'استمع للبث المباشر من إذاعة القرآن الكريم',
      href: '/live',
      color: 'var(--error-color)'
    },
    {
      icon: '🔍',
      title: 'البحث في القرآن',
      description: 'ابحث في آيات القرآن الكريم بسهولة ويسر',
      href: '/search',
      color: 'var(--info-color)'
    },
    {
      icon: '⚡',
      title: 'API للمطورين',
      description: 'استخدم API القرآن الكريم في تطبيقاتك',
      href: 'https://quran-api-qklj.onrender.com/docs',
      color: 'var(--secondary-color)'
    }
  ];

  // إحصائيات الموقع
  const stats = [
    { number: '114', label: 'سورة', icon: '📚' },
    { number: '6236', label: 'آية', icon: '✨' },
    { number: '30', label: 'جزء', icon: '📖' },
    { number: '50+', label: 'قارئ', icon: '🎙️' }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>القرآن الكريم - الموقع الشامل لتلاوة واستماع وتصفح القرآن</title>
        <meta name="description" content="موقع القرآن الكريم الشامل يوفر تلاوة وتصفح واستماع القرآن الكريم بأفضل جودة وأسهل طريقة. استمع لأشهر القراء وحمل المصحف PDF." />
        <meta name="keywords" content="القرآن الكريم, تلاوة القرآن, استماع القرآن, مصحف PDF, قراء القرآن, تفسير القرآن" />
        <meta property="og:title" content="القرآن الكريم - الموقع الشامل" />
        <meta property="og:description" content="موقع شامل لتلاوة وتصفح واستماع القرآن الكريم" />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_BASE_URL} />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL} />
      </Head>

      <div className="homepage">
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
              بسم الله الرحمن الرحيم
            </h1>
            <h2 className="hero-subtitle">
              {heroImages[currentImageIndex].title}
            </h2>
            <p className="hero-description">
              موقع شامل لتلاوة وتصفح واستماع القرآن الكريم بأفضل جودة وأسهل طريقة.
              استمتع بتجربة روحانية فريدة مع كلام الله عز وجل.
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
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
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
              {features.map((feature, index) => (
                <Link key={index} href={feature.href} className="feature-card">
                  <div className="feature-icon" style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <div className="feature-arrow">←</div>
                </Link>
              ))}
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
        }

        /* Hero Section */
        .hero {
          position: relative;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
        }

        .hero-image-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(25, 118, 210, 0.8) 0%,
            rgba(21, 101, 192, 0.9) 100%
          );
          z-index: 2;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          max-width: 800px;
          padding: 0 var(--spacing-lg);
        }

        .hero-title {
          font-size: clamp(2rem, 6vw, 4rem);
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          font-family: var(--font-family-arabic);
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hero-subtitle {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 600;
          margin-bottom: var(--spacing-lg);
          font-family: var(--font-family-arabic);
          opacity: 0.9;
        }

        .hero-description {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          line-height: 1.8;
          margin-bottom: var(--spacing-2xl);
          font-family: var(--font-family-arabic);
          opacity: 0.9;
        }

        .hero-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-btn {
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
          background: transparent;
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
        }

        .stat-card {
          text-align: center;
          padding: var(--spacing-xl);
          background: var(--background-color);
          border-radius: var(--border-radius-xl);
          border: 1px solid var(--border-color);
          transition: all var(--transition-base);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .stat-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }

        .stat-number {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: var(--spacing-sm);
        }

        .stat-label {
          font-size: var(--font-size-lg);
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

        .feature-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
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
          font-size: var(--font-size-xl);
          color: var(--primary-color);
          transition: all var(--transition-base);
        }

        .feature-card:hover .feature-arrow {
          transform: translateX(-4px);
        }

        /* CTA Section */
        .cta-section {
          padding: var(--spacing-3xl) 0;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero {
            height: 100vh;
            padding: 0 var(--spacing-md);
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .hero-btn {
            width: 100%;
            max-width: 280px;
            justify-content: center;
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

        @media (max-width: 480px) {
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