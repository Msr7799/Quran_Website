// src/components/SeoHead.jsx - Fixed SEO Component
import Head from 'next/head';
import { useRouter } from 'next/router';

const SeoHead = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'موقع القرآن الكريم',
  siteName = 'القرآن الكريم',
  locale = 'ar_AR',
  twitterCard = 'summary_large_image',
  noindex = false,
  canonical,
  alternateLanguages = [],
  structuredData = null,
  favicon = '/favicon.ico',
  appleTouchIcon = '/apple-touch-icon.png'
}) => {
  const router = useRouter();
  
  // Setup default values
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://quran-app.com';
  const currentUrl = url || `${baseUrl}${router.asPath}`;
  const canonicalUrl = canonical || currentUrl;
  
  const defaultTitle = 'القرآن الكريم - الموقع الشامل لتلاوة واستماع وتصفح القرآن';
  const defaultDescription = 'موقع شامل للقرآن الكريم يوفر تلاوة وتصفح واستماع القرآن بأفضل جودة. استمع لأشهر القراء وحمل المصحف PDF مجاناً.';
  const defaultKeywords = 'القرآن الكريم, تلاوة القرآن, استماع القرآن, قراء القرآن, مصحف PDF, تفسير القرآن, الإسلام';
  const defaultImage = `${baseUrl}/images/og-default.jpg`;
  
  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalImage = image || defaultImage;

  return (
    <Head>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="language" content="Arabic" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Favicon */}
      <link rel="icon" href={favicon} />
      <link rel="apple-touch-icon" href={appleTouchIcon} />
      
      {/* PWA */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#1976d2" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  );
};

export default SeoHead;
