import { NextResponse } from "next/server";
import { fetchQuranData } from "@/lib/quran-data-api";

type PageBoundary = { surah_number: number; verse: number; name: { ar: string; en: string; transliteration: string } };
type PageResult = { page: number; image: { url: string }; start: PageBoundary; end: PageBoundary };
type PageResponse = { success: boolean; result?: PageResult[] };

export async function GET(_: Request, { params }: { params: Promise<{ page: string }> }) {
  const page = Number((await params).page);
  if (!Number.isInteger(page) || page < 1 || page > 604) return NextResponse.json({ error: "Invalid Quran page" }, { status: 400 });
  try {
    const payload = await fetchQuranData<PageResponse>(`pages?page=${page}`); const result = payload.result?.[0];
    if (!payload.success || !result) return NextResponse.json({ error: "Quran page unavailable" }, { status: 404 });
    return NextResponse.json({ ...result, image: `/api/quran-page/${page}/image` }, { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=2592000" } });
  } catch {
    return NextResponse.json({ error: "Unable to load Quran page" }, { status: 502 });
  }
}
