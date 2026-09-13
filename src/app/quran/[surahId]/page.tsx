import type { Metadata } from "next";
import Image from "next/image";
import { cloudinaryAsset } from "@/lib/cloudinary-assets";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SynchronizedReader } from "@/components/SynchronizedReader";
import { WaqfGuideLink } from "@/components/WaqfGuideLink";
import { getSurah, getSurahNameAssets, getSurahs, getSynchronizedReciters } from "@/lib/quran";
import { quranDataAssetUrl } from "@/lib/quran-data-api";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ surahId: string }> };
export async function generateStaticParams() {
  return (await getSurahs()).map((s) => ({ surahId: String(s.number) }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = Number((await params).surahId);
  const surah = await getSurah(id);
  if (!surah) return {};
  return createPageMetadata({
    title: `سورة ${surah.name.ar}`,
    description: `قراءة سورة ${surah.name.ar} كاملة بالتشكيل، وعدد آياتها ${surah.verses_count} آية.`,
    path: `/quran/${id}`,
  });
}

export default async function SurahPage({ params }: Props) {
  const id = Number((await params).surahId);
  const [surah, surahs, synchronizedReciters, surahNameAssets] = await Promise.all([
    getSurah(id),
    getSurahs(),
    getSynchronizedReciters(),
    getSurahNameAssets(),
  ]);
  if (!surah) notFound();
  const previousSurah = surahs[id - 2];
  const nextSurah = surahs[id];
  const surahNameImage = surahNameAssets.find((item) => item.number === id)?.image_url;
  return (
    <article className="reader-shell">
      <header className="surah-header">
        <WaqfGuideLink />
        <span>سورة رقم {surah.number}</span>
        <h1 className="surah-calligraphy"><span>سورة {surah.name.ar}</span><Image src={surahNameImage ? quranDataAssetUrl(surahNameImage) : cloudinaryAsset(`/svg/surah_name/00${surah.number}.svg`)} width={280} height={110} alt={`سورة ${surah.name.ar}`} priority /></h1>
        <p>
          {surah.revelation_place.ar} · {surah.verses_count} آية · الجزء{" "}
          {surah.verses[0]?.juz}
        </p>
        <nav className="surah-header-navigation" aria-label="التنقل بين السور">
          {previousSurah ? (
            <Link href={`/quran/${previousSurah.number}`} className="previous-surah">
              <small>سورة {previousSurah.name.ar}</small><strong><span aria-hidden="true">→</span> السابقة</strong>
            </Link>
          ) : <span />}
          {nextSurah ? (
            <Link href={`/quran/${nextSurah.number}`} className="next-surah">
              <small>سورة {nextSurah.name.ar}</small><strong>التالية <span aria-hidden="true">←</span></strong>
            </Link>
          ) : <span />}
        </nav>
      </header>
      <SynchronizedReader surah={surah} surahs={surahs} reciters={synchronizedReciters} />
    </article>
  );
}
