import type { Metadata } from "next";
import { LiveBroadcast } from "@/components/LiveBroadcast";
import { getRadios } from "@/lib/quran";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "البث المباشر",
  description: "شاهد قنوات القرآن الكريم واستمع إلى الإذاعات القرآنية المباشرة على مدار الساعة.",
  path: "/live",
});

export default async function LivePage() {
  return <LiveBroadcast radios={await getRadios()} />;
}
