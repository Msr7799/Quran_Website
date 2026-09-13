import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MushafViewer } from "@/components/MushafViewer";
import { createPageMetadata } from "@/lib/seo";
type Props = { params: Promise<{ page: string }> };
export function generateStaticParams() {
  return Array.from({ length: 604 }, (_, i) => ({ page: String(i + 7) }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = Number((await params).page);
  return createPageMetadata({
    title: `صفحة ${page} من المصحف`,
    description: `قراءة الصفحة ${page} من القرآن الكريم بخط واضح ومتجاوب.`,
    path: `/quran-pages/${page}`,
  });
}
export default async function QuranPage({ params }: Props) {
  const page = Number((await params).page);
  if (!Number.isInteger(page) || page < 7 || page > 610) notFound();
  return <><h1 className="visually-hidden">صفحة {page} من المصحف الشريف</h1><MushafViewer page={page} /></>;
}
