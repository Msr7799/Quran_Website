import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* تحسين تحميل الخطوط */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link 
          href="https://fonts.googleapis.com/icon?family=Material+Icons" 
          rel="stylesheet" 
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* منع الوميض فوراً */
            html {
              background-color: #fafafa !important;
              transition: none !important;
            }
            body {
              background-color: #fafafa !important;
              margin: 0;
              padding: 0;
              transition: none !important;
            }
            /* إخفاء المحتوى حتى يتم تحميل React */
            #__next {
              opacity: 0;
              transition: opacity 0.3s ease-in-out;
            }
            #__next.loaded {
              opacity: 1;
            }
            /* fallback إذا لم يعمل JavaScript */
            noscript + #__next {
              opacity: 1 !important;
            }
            `,
          }}
        />
        <noscript>
          <style>
            {`#__next { opacity: 1 !important; }`}
          </style>
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // منع وميض الصفحة - مبسط ومحسن
            (function() {
              // تطبيق الخلفية فوراً
              document.documentElement.style.backgroundColor = '#fafafa';
              document.body.style.backgroundColor = '#fafafa';

              let loaded = false;

              function showContent() {
                if (!loaded) {
                  loaded = true;
                  const nextDiv = document.getElementById('__next');
                  if (nextDiv) {
                    nextDiv.classList.add('loaded');
                  }
                }
              }

              // إظهار المحتوى عند تحميل React
              window.addEventListener('load', showContent);
              document.addEventListener('DOMContentLoaded', showContent);

              // backup timeout - إظهار المحتوى بعد 2 ثانية كحد أقصى
              setTimeout(showContent, 2000);

              // إظهار فوري إذا كان DOM جاهز
              if (document.readyState === 'complete') {
                setTimeout(showContent, 100);
              }
            })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
 
      </body>
    </Html>
  );
}
