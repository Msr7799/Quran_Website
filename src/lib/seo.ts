import type { Metadata } from "next";
import { cloudinaryAsset } from "./cloudinary-assets";

export const SITE_NAME = "القرآن المجيد";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://msr-quran-app.vercel.app";
export const SOCIAL_IMAGE = cloudinaryAsset("/images/social-card.png");

type PageMetadata = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  keywords?: string[];
  noIndex?: boolean;
};

/** Creates consistent canonical, Open Graph and X/Twitter metadata for public pages. */
export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: PageMetadata): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ar_AR",
      url: path,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        { url: SOCIAL_IMAGE, width: 1200, height: 630, alt: `${title} | ${SITE_NAME}` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}

export function safeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
