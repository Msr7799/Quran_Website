// src/pages/quran-pdf/index.jsx - صفحة المصحف PDF المحدثة
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import BookCard from '../../components/BookCard';

/**
 * صفحة المصحف PDF المحدثة
 * تعرض مجموعة من المصاحف المتاحة للتحميل
 */
const QuranPdfPage = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredPdfs, setFilteredPdfs] = useState([]);

  // التأكد من تحميل المكون
  useEffect(() => {
    setMounted(true);
  }, []);

  // بيانات المصاحف
  const pdfs = [
    {
      id: 1,
      title: "مصحف المدينة المنورة باللون الأزرق",
      format: "PDF",
      fileSize: "160 MB",
      publicationYear: "1429 للهجرة",
      pdfLink: "https://archive.org/download/Quran-Kareem-Khawagah-The-Blue-Page-Quran/Quran-Kareem-Khawagah-The-Blue-Page-Quran.pdf",
      pdfImage: "/images/001.webp",
      bgColor: "أزرق",
      description: "المصحف الشريف برواية حفص عن عاصم، مطبوع بالخط العثماني الجميل مع إطار أزرق مميز",
      category: "مدينة"
    },
    {
      id: 2,
      title: "مصحف المدينة المنورة باللون الأخضر",
      format: "PDF",
      fileSize: "158 MB",
      publicationYear: "1429 للهجرة",
      pdfLink: "https://archive.org/download/EQuran00001/E-Quran-00001.pdf",
      pdfImage: "/images/002.webp",
      bgColor: "أخضر",
      description: "نسخة خاصة من مصحف المدينة المنورة بتصميم أخضر هادئ ومريح للعين",
      category: "مدينة"
    },
    {
      id: 3,
      title: "مصحف المدينة المنورة الجوامعي الكبير",
      format: "PDF",
      fileSize: "93 MB",
      publicationYear: "1427 للهجرة",
      pdfLink: "https://archive.org/download/arabic-568335686835685363568q3an1/arabic-quran2.pdf",
      pdfImage: "/images/003.webp",
      bgColor: "أزرق",
      description: "مصحف بحجم كبير مناسب للمساجد والمراكز الإسلامية مع وضوح استثنائي",
      category: "مدينة"
    },
    {
      id: 4,
      title: "مصحف التجويد الملون",
      format: "PDF",
      fileSize: "192 MB",
      publicationYear: "1420 للهجرة",
      pdfLink: "https://archive.org/download/bensaoud_gmail_20170308_0721/%D9%85%D8%B5%D8%AD%D9%81%20%D8%A7%D9%84%D8%AA%D8%AC%D9%88%D9%8A%D8%AF%20%D8%A7%D9%84%D9%85%D9%84%D9%88%D9%86.pdf",
      pdfImage: "/images/004.webp",
      bgColor: "برتقالي",
      description: "مصحف مخصص لتعلم التجويد مع الألوان التي تساعد على فهم أحكام التلاوة",
      category: "تجويد"
    },
    {
      id: 5,
      title: "مصحف الحرمين الشريفين",
      format: "PDF",
      fileSize: "145 MB",
      publicationYear: "1430 للهجرة",
      pdfLink: "https://archive.org/download/QuranHaramain/QuranHaramain.pdf",
      pdfImage: "/images/005.webp",
      bgColor: "أحمر",
      description: "مصحف الحرمين الشريفين بطباعة فاخرة وتصميم مميز",
      category: "حرمين"
    },
    {
      id: 6,
      title: "مصحف برواية ورش",
      format: "PDF",
      fileSize: "125 MB",
      publicationYear: "1425 للهجرة",
      pdfLink: "https://archive.org/download/QuranWarsh/QuranWarsh.pdf",
      pdfImage: "/images/006.webp",
      bgColor: "أخضر",
      description: "القرآن الكريم برواية ورش عن نافع، مطبوع بعناية فائقة",
      category: "روايات"
    }
  ];

  // خيارات التصفية
  const filterOptions = [
    { value: 'all', label: 'جميع المصاحف', icon: '📚' },
    { value: 'مدينة', label: 'مصحف المدينة', icon: '🕌' },
    { value: 'تجويد', label: 'مصاحف التجويد', icon: '🎯' },
    { value: 'حرمين', label: 'مصحف الحرمين', icon: '🏛️' },
    { value: 'روايات', label: 'الروايات المختلفة', icon: '📖' }
  ];

  // تصفية المصاحف
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredPdfs(pdfs);
    } else {
      setFilteredPdfs(pdfs.filter(pdf => pdf.category === selectedFilter));
    }
  }, [selectedFilter]);

  // إحصائيات المصاحف
  const stats = [
    { number: pdfs.length, label: 'مصحف متاح', icon: '📚' },
    { number: filterOptions.length - 1, label: 'فئة مختلفة', icon: '🏷️' },
    { number: '2TB+', label: 'مساحة تخزين', icon: '💾' },
    { number: '100K+', label: 'تحميل شهري', icon: '📥' }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>المصحف PDF - تحميل القرآن الكريم بصيغة PDF</title>
        <meta name="description" content="حمل القرآن الكريم بصيغة PDF بجودة عالية. مصاحف متنوعة من مصحف المدينة المنورة ومصحف التجويد والحرمين الشريفين." />
        <meta name="keywords" content="مصحف PDF, تحميل القرآن, مصحف المدينة المنورة, مصحف التجويد, القرآن الكريم PDF" />
        <meta property="og:title" content="المصحف PDF - تحميل القرآن الكريم" />
        <meta property="og:description" content="حمل القرآن الكريم بصيغة PDF بجودة عالية من مصادر موثوقة" />
        <meta property="og:image" content="/images/quran-pdf-og.jpg" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/quran-pdf`} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_BASE_URL}/quran-pdf`} />
      </Head>

      <div className="quran-pdf-page">
        <div className="container">
          {/* العنوان الرئيسي */}
          <div className="header">
            <h1 className="main-title">المصحف PDF</h1>
            <p className="subtitle">
              حمل القرآن الكريم بصيغة PDF بجودة عالية لتصفحه في أي وقت ومكان
            </p>
          </div>

          {/* الإحصائيات */}
          <div className="stats-section">
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

          {/* أزرار التصفية */}
          <div className="filter-section">
            <h2 className="filter-title">تصفية المصاحف</h2>
            <div className="filter-buttons">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  className={`filter-btn ${selectedFilter === option.value ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(option.value)}
                >
                  <span className="filter-icon">{option.icon}</span>
                  <span className="filter-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* شبكة المصاحف */}
          <div className="pdfs-section">
            <div className="section-header">
              <h2 className="section-title">
                {selectedFilter === 'all' 
                  ? 'جميع المصاحف المتاحة' 
                  : `مصاحف ${filterOptions.find(opt => opt.value === selectedFilter)?.label}`
                }
              </h2>
              <p className="section-description">
                {filteredPdfs.length} مصحف متاح للتحميل
              </p>
            </div>

            <div className="pdfs-grid">
              {filteredPdfs.map((pdf) => (
                <BookCard
                  key={pdf.id}
                  title={pdf.title}
                  format={pdf.format}
                  fileSize={pdf.fileSize}
                  publicationYear={pdf.publicationYear}
                  pdfLink={pdf.pdfLink}
                  pdfImage={pdf.pdfImage}
                  bgColor={pdf.bgColor}
                  description={pdf.description}
                />
              ))}
            </div>

            {filteredPdfs.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon">📚</div>
                <h3 className="no-results-title">لا توجد مصاحف في هذه الفئة</h3>
                <p className="no-results-description">
                  جرب اختيار فئة أخرى أو تصفح جميع المصاحف المتاحة
                </p>
                <button 
                  className="no-results-btn"
                  onClick={() => setSelectedFilter('all')}
                >
                  عرض جميع المصاحف
                </button>
              </div>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="info-section">
            <div className="info-grid">
              <div className="info-card">
                <div className="info-icon">⚡</div>
                <h3 className="info-title">تحميل سريع</h3>
                <p className="info-description">
                  جميع المصاحف مستضافة على خوادم سريعة لضمان تحميل سلس
                </p>
              </div>
              
              <div className="info-card">
                <div className="info-icon">🔒</div>
                <h3 className="info-title">مصادر موثوقة</h3>
                <p className="info-description">
                  جميع المصاحف من مصادر رسمية ومعتمدة من الجهات المختصة
                </p>
              </div>
              
              <div className="info-card">
                <div className="info-icon">📱</div>
                <h3 className="info-title">متوافق مع الأجهزة</h3>
                <p className="info-description">
                  يمكن فتح الملفات على جميع الأجهزة والتطبيقات
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* الأنماط */}
        <style jsx>{`
          .quran-pdf-page {
            width: 100%;
            min-height: 100vh;
            background: var(--background-color);
            padding: var(--spacing-xl) 0;
          }

          .header {
            text-align: center;
            margin-bottom: var(--spacing-3xl);
          }

          .main-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: var(--spacing-md);
            font-family: var(--font-family-arabic);
          }

          .subtitle {
            font-size: var(--font-size-lg);
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.7;
            font-family: var(--font-family-arabic);
          }

          .stats-section {
            margin-bottom: var(--spacing-3xl);
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--spacing-lg);
          }

          .stat-card {
            background: var(--background-paper);
            padding: var(--spacing-xl);
            border-radius: var(--border-radius-xl);
            text-align: center;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
            transition: all var(--transition-base);
          }

          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
          }

          .stat-icon {
            font-size: 2.5rem;
            margin-bottom: var(--spacing-md);
          }

          .stat-number {
            font-size: clamp(1.5rem, 3vw, 2rem);
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: var(--spacing-sm);
          }

          .stat-label {
            font-size: var(--font-size-base);
            color: var(--text-secondary);
            font-family: var(--font-family-arabic);
          }

          .filter-section {
            margin-bottom: var(--spacing-3xl);
            text-align: center;
          }

          .filter-title {
            font-size: var(--font-size-2xl);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-lg);
            font-family: var(--font-family-arabic);
          }

          .filter-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-md);
            justify-content: center;
          }

          .filter-btn {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            padding: var(--spacing-md) var(--spacing-lg);
            background: var(--background-paper);
            border: 2px solid var(--border-color);
            border-radius: var(--border-radius-xl);
            cursor: pointer;
            transition: all var(--transition-base);
            font-family: var(--font-family-arabic);
            font-size: var(--font-size-base);
          }

          .filter-btn:hover {
            border-color: var(--primary-color);
            background: var(--primary-color);
            color: white;
          }

          .filter-btn.active {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
          }

          .filter-icon {
            font-size: 1.2rem;
          }

          .pdfs-section {
            margin-bottom: var(--spacing-3xl);
          }

          .section-header {
            text-align: center;
            margin-bottom: var(--spacing-2xl);
          }

          .section-title {
            font-size: var(--font-size-2xl);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
            font-family: var(--font-family-arabic);
          }

          .section-description {
            font-size: var(--font-size-base);
            color: var(--text-secondary);
            font-family: var(--font-family-arabic);
          }

          .pdfs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: var(--spacing-xl);
          }

          .no-results {
            text-align: center;
            padding: var(--spacing-3xl);
            background: var(--background-paper);
            border-radius: var(--border-radius-xl);
            border: 1px solid var(--border-color);
          }

          .no-results-icon {
            font-size: 4rem;
            margin-bottom: var(--spacing-lg);
          }

          .no-results-title {
            font-size: var(--font-size-xl);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-md);
            font-family: var(--font-family-arabic);
          }

          .no-results-description {
            font-size: var(--font-size-base);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-lg);
            font-family: var(--font-family-arabic);
          }

          .no-results-btn {
            padding: var(--spacing-md) var(--spacing-xl);
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius-lg);
            cursor: pointer;
            font-size: var(--font-size-base);
            font-weight: 600;
            transition: all var(--transition-base);
            font-family: var(--font-family-arabic);
          }

          .no-results-btn:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
          }

          .info-section {
            margin-top: var(--spacing-3xl);
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: var(--spacing-xl);
          }

          .info-card {
            background: var(--background-paper);
            padding: var(--spacing-2xl);
            border-radius: var(--border-radius-xl);
            text-align: center;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
            transition: all var(--transition-base);
          }

          .info-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
          }

          .info-icon {
            font-size: 3rem;
            margin-bottom: var(--spacing-md);
          }

          .info-title {
            font-size: var(--font-size-lg);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-md);
            font-family: var(--font-family-arabic);
          }

          .info-description {
            font-size: var(--font-size-base);
            color: var(--text-secondary);
            line-height: 1.6;
            font-family: var(--font-family-arabic);
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: var(--spacing-md);
            }

            .filter-buttons {
              flex-direction: column;
              align-items: center;
            }

            .filter-btn {
              width: 100%;
              max-width: 280px;
              justify-content: center;
            }

            .pdfs-grid {
              grid-template-columns: 1fr;
              gap: var(--spacing-md);
            }

            .info-grid {
              grid-template-columns: 1fr;
              gap: var(--spacing-md);
            }
          }

          @media (max-width: 480px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }

            .stat-card {
              padding: var(--spacing-lg);
            }

            .filter-btn {
              padding: var(--spacing-sm) var(--spacing-md);
            }

            .info-card {
              padding: var(--spacing-lg);
            }
          }

          /* تحسين الأداء */
          .stat-card,
          .filter-btn,
          .info-card {
            will-change: transform;
            contain: layout style paint;
          }

          /* تحسين للطباعة */
          @media print {
            .filter-section,
            .stats-section {
              display: none;
            }
            
            .pdfs-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default QuranPdfPage;