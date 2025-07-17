import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // منع وميض الصفحة عند التحميل
            (function() {
              // Initialize theme from localStorage or default to light
              const savedTheme = typeof window !== 'undefined' && localStorage.getItem('darkMode');
              const isDark = savedTheme ? JSON.parse(savedTheme) : false;
              const theme = isDark ? 'dark' : 'light';
              
              // Set theme attribute on html element
              document.documentElement.setAttribute('data-theme', theme);
              
              // Set MUI theme color scheme
              document.documentElement.style.setProperty('--joy-palette-mode', theme);
              document.body.style.backgroundColor = theme === 'dark' ? '#1B1B1B' : '#E4E4E4';
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
