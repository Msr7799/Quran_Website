// المسار: src/components/icons.tsx — يوفر مكوّنات الأيقونات المعتمدة على صور المشروع.
import Image from "next/image";
import type { ComponentType } from "react";

type IconComponent = ComponentType<{ className?: string }>;
// ينشئ مكوّن أيقونة موحدًا من ملف صورة.
const assetIcon = (src: string, alt: string): IconComponent =>
  // يعرض ملف الصورة داخل غلاف أيقونة موحد.
  function AssetIcon({ className }) {
  const detailedClass = src.startsWith("/svg/nav/") ? " nav-detailed-icon" : "";
  return <Image className={`nav-asset-icon${detailedClass} ${className ?? ""}`} src={src} width={48} height={48} alt={alt} aria-hidden="true" />;
};

const HomeIcon = assetIcon("/svg/home.svg", "");
const QuranWrittenIcon = assetIcon("/svg/nav/quran_reader_and_tafsir.webp", "");
const MushafIcon = assetIcon("/svg/nav/al_mushaf.webp", "");
const QuranAudioIcon = assetIcon("/svg/nav/listening_to_quran.webp", "");
const BooksPdfIcon = assetIcon("/svg/nav/library_pdf.webp", "");
const LiveIcon = assetIcon("/svg/nav/live_broadcast.webp", "");
const VideoIcon = assetIcon("/svg/nav/youtube_channel.webp", "");
const CalendarIcon = assetIcon("/svg/nav/islamic_calendar.webp", "");
const ResearchIcon = assetIcon("/svg/nav/deep_search.webp", "");
const NoorIcon = assetIcon("/svg/nav/noor_chat.webp", "");
const AboutIcon = assetIcon("/svg/nav/about.webp", "");

export type NavItem = { href: string; label: string; translationKey: string; icon: IconComponent };

export const navigation: NavItem[] = [
  { href: "/", label: "الرئيسية", translationKey: "common.home", icon: HomeIcon },
  { href: "/quran/1", label: "قراءة القرآن", translationKey: "quran.read", icon: QuranWrittenIcon },
  { href: "/quran-pages/7", label: "تصفح المصحف", translationKey: "navigation.quranPages", icon: MushafIcon },
  { href: "/quran-sound", label: "الاستماع", translationKey: "navigation.quranSound", icon: QuranAudioIcon },
  { href: "/quran-pdf", label: "المصحف PDF", translationKey: "navigation.quranPDF", icon: BooksPdfIcon },
  { href: "/live", label: "البث المباشر", translationKey: "navigation.live", icon: LiveIcon },
  { href: "/youtube", label: "محتوى اليوتيوب", translationKey: "youtube.navigation", icon: VideoIcon },
  { href: "/calendar", label: "التقويم الهجري والميلادي", translationKey: "navigation.calendar", icon: CalendarIcon },
  { href: "/search", label: "البحث في القرآن", translationKey: "navigation.quranSearch", icon: ResearchIcon },
  { href: "/chat-bot", label: "المساعد الإسلامي", translationKey: "navigation.chatBot", icon: NoorIcon },
  { href: "/about", label: "عن الموقع", translationKey: "common.about", icon: AboutIcon },
];
