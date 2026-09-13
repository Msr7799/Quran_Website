import type { Metadata } from "next";
import { NoorChat } from "@/components/NoorChat";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "نور AI | المساعد الإسلامي",
  description: "مساعد إسلامي ذكي للإجابة العامة والإرشاد إلى القرآن الكريم والمصادر الموثوقة.",
  path: "/chat-bot",
  noIndex: true,
});

export default function ChatPage() {
  return <NoorChat />;
}
