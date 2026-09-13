import { HeroCarousel } from "@/components/HeroCarousel";
import { HomeContent } from "@/components/HomeContent";
import { getAzkar, getCollections, getSurahs } from "@/lib/quran";
import { getHeroMedia } from "@/lib/hero-media";
import { getYouTubeHomeContent } from "@/lib/youtube";
import { safeJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";

type AzkarFile = { data: Array<{ id: number; category: string; zekr: string; reference: string }> };
type Collection = { bookNumber: number; bookName: string; aboutBook: string; parts_count: number };

function decodeText(value: string) {
  return /[ÃØÙÛ]/.test(value) ? Buffer.from(value, "latin1").toString("utf8") : value;
}

async function loadHomeData() {
  const [azkar, collections] = await Promise.all([getAzkar() as Promise<AzkarFile>, getCollections() as Promise<Collection[]>]);
  return {
    azkar: azkar.data.slice(0, 12).map((item) => ({ ...item, category: decodeText(item.category), zekr: decodeText(item.zekr), reference: decodeText(item.reference) })),
    collections: collections.map((item) => ({ ...item, bookName: decodeText(item.bookName), aboutBook: decodeText(item.aboutBook) })),
  };
}

export default async function Home() {
  const [surahs, content, heroMedia, youtubeContent] = await Promise.all([getSurahs(), loadHomeData(), getHeroMedia(), getYouTubeHomeContent()]);
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: "القرآن الكريم",
    url: `${SITE_URL}/`,
    inLanguage: ["ar", "en", "tr", "hi", "ur", "ru", "es", "fr", "de", "it", "pt", "zh", "ja", "ko", "id"],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }} />
    <HeroCarousel desktopMedia={heroMedia.desktop} mobileMedia={heroMedia.mobile} />
    <HomeContent surahs={surahs} azkar={content.azkar} collections={content.collections} youtubeContent={youtubeContent} />
  </>;
}
