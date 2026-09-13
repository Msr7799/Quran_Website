import type { MetadataRoute } from "next";
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://msr-quran-app.vercel.app/";
export default function robots(): MetadataRoute.Robots { return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/auth/", "/search?"] }], sitemap: `${base}/sitemap.xml`, host: base }; }
