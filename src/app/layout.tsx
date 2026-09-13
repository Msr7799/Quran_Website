import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { FloatingTools } from "@/components/FloatingTools";
import { Header } from "@/components/Header";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { cloudinaryAsset } from "@/lib/cloudinary-assets";
import { SITE_NAME, SITE_URL, SOCIAL_IMAGE } from "@/lib/seo";
import "./globals.css";

const themeInitializer = `(function(){try{var saved=localStorage.getItem("theme");var dark=saved?saved==="dark":true;var root=document.documentElement;root.dataset.theme=dark?"dark":"light";root.style.colorScheme=dark?"dark":"light"}catch(error){document.documentElement.dataset.theme="dark"}})();`;
const title = `${SITE_NAME} | قراءة واستماع للقرآن الكريم`;
const description = "اقرأ القرآن الكريم كاملاً، واستمع لأشهر القراء، وتصفّح صفحات المصحف وابحث في الآيات بسهولة على جميع الأجهزة.";
const supportedOpenGraphLocales = ["en_US", "tr_TR", "hi_IN", "ur_PK", "ru_RU", "es_ES", "fr_FR", "de_DE", "it_IT", "pt_BR", "zh_CN", "ja_JP", "ko_KR", "id_ID"];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "tedQd55zrvYnRtg8uOcxm7sTuI3AZhKVSyQU-2Gq9pg",
  },
  title: { default: title, template: "%s | القرآن المجيد" },
  description,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false },
  keywords: ["القرآن الكريم", "القرآن المجيد", "قراءة القرآن", "استماع القرآن", "تفسير القرآن", "مصحف", "تلاوة القرآن", "سور القرآن", "Quran", "Holy Quran"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    alternateLocale: supportedOpenGraphLocales,
    url: "/",
    siteName: SITE_NAME,
    title,
    description,
    images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image", title, description, images: [SOCIAL_IMAGE] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  manifest: "/manifest.webmanifest",
  icons: { icon: cloudinaryAsset("/alf.png"), shortcut: cloudinaryAsset("/alf.png"), apple: cloudinaryAsset("/alf.png") },
  category: "education",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3e8" },
    { media: "(prefers-color-scheme: dark)", color: "#071813" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" translate="no" className="notranslate" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <script id="theme-initializer" dangerouslySetInnerHTML={{ __html: themeInitializer }} />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2259594031936212"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <LocaleProvider>
          <div id="app-root">
            <a className="skip-link" href="#main">انتقل إلى المحتوى</a>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <FloatingTools />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
