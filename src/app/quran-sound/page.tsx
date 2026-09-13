import type { Metadata } from "next";
import { AudioDirectory } from "@/components/AudioDirectory";
import { getReciters, getSurahs } from "@/lib/quran";
import { createPageMetadata } from "@/lib/seo";
export const metadata: Metadata = createPageMetadata({ title: "الاستماع للقرآن الكريم", description: "استمع إلى القرآن الكريم كاملًا بصوت نخبة من القراء وبرواية حفص عن عاصم.", path: "/quran-sound" });
export default async function AudioPage() { const [reciters, surahs] = await Promise.all([getReciters(), getSurahs()]); return <AudioDirectory reciters={reciters} surahs={surahs} />; }
