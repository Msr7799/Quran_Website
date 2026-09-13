import type { Metadata } from "next";
import { DualCalendar, type ReligiousEvent } from "@/components/DualCalendar";
import { religiousEventTitle } from "@/lib/religious-events";
import { getReligiousEvents } from "@/lib/quran";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({ title: "التقويم الهجري والميلادي", description: "تقويم ميلادي وهجري يعرض المناسبات الدينية والأحاديث المرتبطة بها.", path: "/calendar" });
type EventFile = { data: Array<{ id: number; title: string; month: number; day: number[]; isReminder: boolean; isLottie: boolean; isSvg: boolean; lottiePath: string; svgPath: string; hadith: Array<{ hadith: string; bookInfo: string }> }> };

export default async function CalendarPage() {
  const source = await getReligiousEvents() as EventFile;
  const events: ReligiousEvent[] = source.data.map((item) => ({
    id: item.id, key: item.title, title: religiousEventTitle(item.title), month: item.month, day: item.day, isReminder: item.isReminder,
    hadith: item.hadith[0]?.hadith ?? "", bookInfo: item.hadith[0]?.bookInfo ?? "",
    visual: item.isLottie && item.lottiePath ? { type: "lottie", src: `/lottie/${item.lottiePath}.json` } : item.isSvg && item.svgPath ? { type: "svg", src: item.svgPath.replace(/^assets\/svg\//, "/svg/") } : item.isReminder ? { type: "lottie", src: "/lottie/notification.json" } : undefined,
  }));
  return <section className="calendar-page"><div className="section-heading"><span className="eyebrow">مواعيدك الإسلامية</span><h1>التقويم الهجري والميلادي</h1><p>تصفّح الأيام الميلادية وما يقابلها هجرياً، وتعرّف على المناسبات المسجلة في ملف المناسبات الدينية.</p></div><DualCalendar events={events} /></section>;
}
