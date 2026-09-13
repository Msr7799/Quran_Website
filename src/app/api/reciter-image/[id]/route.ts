import { getReciters } from "@/lib/quran";
import { quranDataAssetUrl } from "@/lib/quran-data-api";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const numericId = Number((await context.params).id);
  if (!Number.isInteger(numericId) || numericId < 1) return new Response(null, { status: 404 });

  const reciter = (await getReciters()).find((item) => item.id === numericId);
  const imageUrl = reciter?.image_url ?? reciter?.image?.url;
  if (!imageUrl) return new Response(null, { status: 404 });

  return new Response(null, {
    status: 307,
    headers: {
      Location: quranDataAssetUrl(imageUrl),
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
