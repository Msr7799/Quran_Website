import type { Metadata } from "next";
import { IslamicLibrary } from "@/components/IslamicLibrary";
import { getLibraryBooks } from "@/lib/quran";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "المكتبة الإلكترونية للمصاحف والكتب",
  description:
    "تحميل المصاحف الشريفة والكتب الإسلامية بصيغة PDF بروابط مباشرة.",
  path: "/quran-pdf",
});
export default async function PdfLibraryPage() {
  return <IslamicLibrary booksPayload={await getLibraryBooks()} />;
}
