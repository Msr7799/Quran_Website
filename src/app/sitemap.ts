import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const staticRoutes = [
  "",
  "/about",
  "/quran-sound",
  "/quran-pdf",
  "/live",
  "/calendar",
  "/youtube",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticRoutes.map((route) => ({ url: `${SITE_URL}${route}` })),
    ...Array.from({ length: 114 }, (_, index) => ({
      url: `${SITE_URL}/quran/${index + 1}`,
    })),
    ...Array.from({ length: 604 }, (_, index) => ({
      url: `${SITE_URL}/quran-pages/${index + 7}`,
    })),
  ];
}
