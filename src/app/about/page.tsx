import type { Metadata } from "next";
import { createPageMetadata, safeJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = createPageMetadata({
  title: "من نحن - موقع القرآن الكريم",
  description: "تعرّف على موقع القرآن الكريم ورؤيته لتقديم محتوى متكامل للقرآن الكريم.",
  path: "/about",
  keywords: ["موقع القرآن الكريم", "معلومات عنا", "رؤية الموقع"],
});

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `من نحن - ${SITE_NAME}`,
    url: `${SITE_URL}/about`,
    description: metadata.description,
    inLanguage: "ar",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} /><AboutContent /></>;
}
