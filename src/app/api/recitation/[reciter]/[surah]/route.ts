import { NextResponse } from "next/server";
import { fetchQuranData } from "@/lib/quran-data-api";

export const runtime = "nodejs";

type WordSegment = [word: number, timestampFrom: number, timestampTo: number];
type ApiAyah = {
  ayah: number;
  audio_url: string | null;
  segments: WordSegment[];
  duration_sec: number | null;
  duration_ms: number | null;
  timestamp_from: number | null;
  timestamp_to: number | null;
};
type ApiRecitation = {
  reciter: {
    id: number;
    reciter: { ar: string; en: string };
    server: string | null;
  };
  recitation_type: "surah-by-surah" | "ayah-by-ayah";
  surah_number: number;
  audio: { audio_url: string; duration: number } | null;
  ayahs: ApiAyah[];
};
type ApiResponse = { success: boolean; data: ApiRecitation };
type Track = { ayah: number; audioUrl: string; timestamp_from: number; timestamp_to: number; duration: number };
type Timing = { ayah: number; timestamp_from: number; timestamp_to: number; duration_ms: number; segments: WordSegment[] };

function ayahDurationMs(ayah: ApiAyah) {
  const segmentEnd = Math.max(0, ...ayah.segments.map((segment) => segment[2]));
  if (ayah.duration_ms && ayah.duration_ms > 0) return ayah.duration_ms;
  if (ayah.duration_sec && ayah.duration_sec > 0) return Math.round(ayah.duration_sec * 1000);
  if (ayah.timestamp_from !== null && ayah.timestamp_to !== null && ayah.timestamp_to > ayah.timestamp_from) {
    return ayah.timestamp_to - ayah.timestamp_from;
  }
  return Math.max(1, segmentEnd);
}

function normalizeSurahRecitation(data: ApiRecitation) {
  if (!data.audio?.audio_url) return null;
  const segments: Timing[] = data.ayahs.flatMap((ayah) => {
    if (ayah.timestamp_from === null || ayah.timestamp_to === null) return [];
    return [{
      ayah: ayah.ayah,
      timestamp_from: ayah.timestamp_from,
      timestamp_to: ayah.timestamp_to,
      duration_ms: ayah.timestamp_to - ayah.timestamp_from,
      segments: ayah.segments,
    }];
  });
  const finalTimestamp = Math.max(0, ...segments.map((segment) => segment.timestamp_to));
  return {
    audioMode: "surah" as const,
    audioUrl: data.audio.audio_url,
    duration: Math.max(data.audio.duration || 0, finalTimestamp / 1000),
    tracks: [] as Track[],
    segments,
    estimated: false,
  };
}

function normalizeAyahRecitation(data: ApiRecitation) {
  let cursor = 0;
  const tracks: Track[] = [];
  const segments: Timing[] = [];

  for (const ayah of data.ayahs) {
    if (!ayah.audio_url) continue;
    const durationMs = ayahDurationMs(ayah);
    const from = cursor;
    const to = from + durationMs;
    tracks.push({ ayah: ayah.ayah, audioUrl: ayah.audio_url, timestamp_from: from, timestamp_to: to, duration: durationMs / 1000 });
    segments.push({
      ayah: ayah.ayah,
      timestamp_from: from,
      timestamp_to: to,
      duration_ms: durationMs,
      segments: ayah.segments.map(([word, wordFrom, wordTo]) => [word, from + wordFrom, from + wordTo]),
    });
    cursor = to;
  }

  if (!tracks.length) return null;
  return {
    audioMode: "ayah" as const,
    audioUrl: tracks[0].audioUrl,
    duration: cursor / 1000,
    tracks,
    segments,
    estimated: false,
  };
}

function surahAudioUrl(server: string | null, surah: number) {
  return server ? `${server.replace(/\/+$/, "")}/${String(surah).padStart(3, "0")}.mp3` : null;
}

export async function GET(request: Request, { params }: { params: Promise<{ reciter: string; surah: string }> }) {
  const { reciter, surah: rawSurah } = await params;
  const surah = Number(rawSurah);
  const reciterId = Number(reciter);
  if (!Number.isInteger(reciterId) || reciterId < 1 || !Number.isInteger(surah) || surah < 1 || surah > 114) {
    return NextResponse.json({ error: "Invalid reciter or surah" }, { status: 404 });
  }

  try {
    const payload = await fetchQuranData<ApiResponse>(`ayah-bayah/${reciterId}/${surah}`);
    if (!payload.success || !payload.data) {
      return NextResponse.json({ error: "Recitation unavailable" }, { status: 404 });
    }

    const normalized = payload.data.recitation_type === "ayah-by-ayah"
      ? normalizeAyahRecitation(payload.data)
      : normalizeSurahRecitation(payload.data);
    if (!normalized) return NextResponse.json({ error: "Recitation unavailable" }, { status: 404 });

    if (new URL(request.url).searchParams.has("download")) {
      const downloadUrl = payload.data.audio?.audio_url ?? surahAudioUrl(payload.data.reciter.server, surah);
      if (!downloadUrl) return NextResponse.json({ error: "Audio download unavailable" }, { status: 404 });
      const upstream = await fetch(downloadUrl, { cache: "no-store", signal: request.signal });
      if (!upstream.ok || !upstream.body) {
        return NextResponse.json({ error: "Audio download unavailable" }, { status: 502 });
      }
      return new Response(upstream.body, {
        headers: {
          "Content-Type": upstream.headers.get("content-type") ?? "audio/mpeg",
          "Content-Disposition": `attachment; filename="reciter-${reciterId}-${String(surah).padStart(3, "0")}.mp3"`,
        },
      });
    }

    return NextResponse.json(
      { reciter: { id: payload.data.reciter.id, ...payload.data.reciter.reciter }, surah, ...normalized },
      { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } },
    );
  } catch {
    return NextResponse.json({ error: "Unable to load recitation" }, { status: 502 });
  }
}
