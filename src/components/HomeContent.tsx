// المسار: src/components/HomeContent.tsx — يجمع أقسام ومحتوى الصفحة الرئيسية.
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AzkarCarousel } from "@/components/AzkarCarousel";
import { CollectionsCarousel } from "@/components/CollectionsCarousel";
import { SurahGrid } from "@/components/SurahGrid";
import { YouTubeShowcase } from "@/components/YouTubeShowcase";
import { navigation } from "@/components/icons";
import { useLocale } from "@/i18n/LocaleProvider";
import type { SurahMeta } from "@/lib/types";
import type { YouTubeHomeContent } from "@/lib/youtube-types";

type Zekr = { id: number; category: string; zekr: string; reference: string };
type Collection = { bookNumber: number; bookName: string; aboutBook: string; parts_count: number };

const featureDescriptionKeys: Record<string, string> = {
  "/quran/1": "home.readDescription",
  "/quran-pages/7": "home.browseDescription",
  "/quran-sound": "home.listenDescription",
  "/quran-pdf": "home.pdfDescription",
  "/live": "home.liveDescription",
  "/calendar": "home.calendarDescription",
  "/search": "home.searchDescription",
  "/chat-bot": "home.assistantDescription",
};

const features = navigation.filter((item) => featureDescriptionKeys[item.href]);

// يركّب أقسام الصفحة الرئيسية من البيانات المتاحة.
export function HomeContent({ surahs, azkar, collections, youtubeContent }: { surahs: SurahMeta[]; azkar: Zekr[]; collections: Collection[]; youtubeContent: YouTubeHomeContent | null }) {
  const { t } = useLocale();

  return <>
    <section className="section">
      <div className="section-heading home-arabic-heading">
        <span className="eyebrow">{t("home.allInOne", "كل ما تحتاجه في مكان واحد")}</span>
        <h1>{t("ui.journey", "رحلتك مع القرآن")}</h1>
        <p>{t("ui.tools", "أدوات بسيطة وخفيفة تساعدك على القراءة والاستماع والبحث.")}</p>
      </div>
      <div className="feature-grid">
        {features.map(({ href, icon: Icon, label, translationKey }) => <Link className="feature-card" href={href} key={href}>
          <span className="feature-icon"><Icon /></span>
          <h3>{t(translationKey, label)}</h3>
          <p>{t(featureDescriptionKeys[href])}</p>
          <span className="text-link">{t("ui.open", "افتح الآن")} <ArrowLeft /></span>
        </Link>)}
      </div>
    </section>
    <section className="section muted-section">
      <div className="section-heading home-arabic-heading">
        <span className="eyebrow">{t("ui.index", "فهرس القرآن الكريم")}</span>
        <h2>{t("ui.chooseSurah", "اختر سورة")}</h2>
        <p>{t("ui.chooseSurahDesc", "انتقل مباشرة إلى السورة التي تريد قراءتها.")}</p>
      </div>
      <SurahGrid surahs={surahs} compact />
    </section>
    <section className="section home-content-section">
      <div className="section-heading home-arabic-heading">
        <span className="eyebrow">{t("ui.daily", "محتوى يومي موثوق")}</span>
        <h2>{t("ui.provision", "زاد المسلم")}</h2>
        <p>{t("ui.provisionDesc", "مختارات مباشرة من ملفات الأذكار والمجموعات الموجودة في المشروع.")}</p>
      </div>
      <div className="home-data-columns"><AzkarCarousel items={azkar} /><CollectionsCarousel items={collections} /></div>
    </section>
    {youtubeContent && <YouTubeShowcase content={youtubeContent} compact />}
  </>;
}
