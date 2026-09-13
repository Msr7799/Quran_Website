import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TafsirButton } from "@/components/TafsirButton";
import { searchQuran } from "@/lib/quran";
import { LottiePlayer } from "@/components/LottiePlayer";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "البحث في القرآن الكريم",
  description: "ابحث في آيات القرآن الكريم، ثم افتح الآية أو صفحة المصحف أو تفسيرها.",
  path: "/search",
  noIndex: true,
});

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ query?: string[] }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const pathQuery = (await params).query?.join(" ");
  const query = decodeURIComponent(pathQuery ?? (await searchParams).q ?? "");
  const results = query ? await searchQuran(query) : [];

  return <div className="content-shell narrow search-page">
    <PageHeader
      eyebrow="وَقُل رَّبِّ زِدْنِي عِلْمًا"
      title="البحث في القرآن"
      description="اكتب كلمة أو جزءًا من آية للوصول إليها وقراءة تفسيرها."
    />
    <form className="large-search" action="/search" method="get">
      <LottiePlayer className="search-lottie" src="/lottie/search.json" />
      <Search />
      <input name="q" defaultValue={query} placeholder="مثال: الرحمن، الصابرين..." />
      <button>بحث</button>
    </form>
    {query && <p className="result-count">{results.length
      ? `عُثر على ${results.length} نتيجة عن «${query}»`
      : `لا توجد نتائج عن «${query}»`}</p>}
    <div className="search-results">
      {results.map((result) => <article className="search-result-card" key={result.id}>
        <header>
          <span>سورة {result.surahName} · الآية {result.ayahNumber}</span>
          <small>الجزء {result.juz} · الصفحة {result.page}</small>
        </header>
        <Link className="search-result-verse" href={`/quran/${result.surahNumber}#ayah-${result.ayahNumber}`}>
          <p className="arabic-verse">{result.text}</p>
        </Link>
        <footer className="search-result-actions">
          <Link href={`/quran/${result.surahNumber}#ayah-${result.ayahNumber}`}><BookOpen /> عرض الآية</Link>
          <Link href={`/quran-pages/${result.page}`}>صفحة المصحف {result.page}</Link>
          <TafsirButton surah={result.surahNumber} ayah={result.ayahNumber} surahName={result.surahName} arabicText={result.text} />
        </footer>
      </article>)}
    </div>
  </div>;
}
