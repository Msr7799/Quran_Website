import "server-only";

import type { YouTubeFeaturedVideo, YouTubeHomeContent, YouTubePlaylist, YouTubeShort } from "@/lib/youtube-types";
import { unstable_cache } from "next/cache";

const CHANNEL_ID = "UCseM-nFP_VlkEO7LveaD72Q";
const FEATURED_VIDEO_IDS = [
  "1SSvEy7dHrM", // Al-Baqarah — Abdul Rahman Al-Sudais
  "O7F6ykIzh-I", // Ar-Rahman — Abdul Rahman Al-Sudais
  "Q7YqzXYv0Jg", // Ya-Sin — Abdul Rahman Al-Sudais
  "Ke21Pq3HUaA", // Al-Baqarah — Maher Al-Muaiqly
  "xLKyMIE9yUU", // Al-Kahf — Maher Al-Muaiqly
] as const;
const API_ROOT = "https://www.googleapis.com/youtube/v3";
const CACHE_TTL_MS = 15 * 60 * 1000;

type OAuthCredentials = { clientId: string; clientSecret: string; refreshToken: string };
type ThumbnailSet = Record<string, { url?: string } | undefined>;
type VideoApiItem = {
  id: string;
  snippet: { title: string; description?: string; publishedAt: string; thumbnails?: ThumbnailSet };
  contentDetails: { duration: string };
  status?: { embeddable?: boolean; privacyStatus?: string };
};

let accessTokenCache: { token: string; expiresAt: number } | null = null;
let contentCache: { value: YouTubeHomeContent; expiresAt: number } | null = null;
let pendingContent: Promise<YouTubeHomeContent | null> | null = null;

function bestThumbnail(thumbnails?: ThumbnailSet) {
  return thumbnails?.maxres?.url ?? thumbnails?.standard?.url ?? thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? "";
}

function parseDuration(duration = "PT0S") {
  const match = duration.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 86400 + Number(match[2] ?? 0) * 3600 + Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0);
}

function getCredentials(): OAuthCredentials {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error("YouTube OAuth environment variables are incomplete");
  return { clientId, clientSecret, refreshToken };
}

async function getAccessToken() {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) return accessTokenCache.token;
  const credentials = getCredentials();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: credentials.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const result = await response.json() as { access_token?: string; expires_in?: number; error_description?: string };
  if (!response.ok || !result.access_token) throw new Error(result.error_description ?? "Could not refresh the YouTube access token");
  accessTokenCache = { token: result.access_token, expiresAt: Date.now() + (result.expires_in ?? 3600) * 1000 };
  return result.access_token;
}

async function youtubeRequest<T>(resource: string, params: Record<string, string>) {
  const token = await getAccessToken();
  const url = new URL(`${API_ROOT}/${resource}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
  const result = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(result.error?.message ?? `YouTube request failed (${response.status})`);
  return result;
}

async function loadYouTubeContent(): Promise<YouTubeHomeContent> {
  const channelResponse = await youtubeRequest<{ items?: Array<{
    id: string;
    snippet: { title: string; thumbnails?: ThumbnailSet };
    contentDetails: { relatedPlaylists: { uploads: string } };
    statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean };
  }> }>("channels", { part: "snippet,contentDetails,statistics", id: CHANNEL_ID });
  const channel = channelResponse.items?.[0];
  if (!channel) throw new Error("The configured YouTube channel was not found");

  const [uploadsResponse, playlistsResponse] = await Promise.all([
    youtubeRequest<{ items?: Array<{ contentDetails: { videoId: string } }> }>("playlistItems", {
      part: "contentDetails",
      playlistId: channel.contentDetails.relatedPlaylists.uploads,
      maxResults: "50",
    }),
    youtubeRequest<{ items?: Array<{
      id: string;
      snippet: { title: string; thumbnails?: ThumbnailSet };
      contentDetails: { itemCount: number };
    }> }>("playlists", { part: "snippet,contentDetails", channelId: CHANNEL_ID, maxResults: "12" }),
  ]);

  const videoIds = (uploadsResponse.items ?? []).map((item) => item.contentDetails.videoId).filter(Boolean);
  const [videosResponse, featuredResponse] = await Promise.all([
    videoIds.length
      ? youtubeRequest<{ items?: VideoApiItem[] }>("videos", { part: "snippet,contentDetails,status", id: videoIds.join(",") })
      : Promise.resolve({ items: [] as VideoApiItem[] }),
    youtubeRequest<{ items?: VideoApiItem[] }>("videos", { part: "snippet,contentDetails,status", id: FEATURED_VIDEO_IDS.join(",") }),
  ]);

  // The Data API does not expose an explicit Shorts flag. The channel marks its
  // real Shorts with #Shorts in either the title or description, so require that
  // marker as well as YouTube's current three-minute duration limit.
  const shortCandidates: Array<YouTubeShort & { markedAsShort: boolean; embeddable: boolean }> = (videosResponse.items ?? [])
    .map((video) => ({
      id: video.id,
      title: video.snippet.title,
      thumbnailUrl: bestThumbnail(video.snippet.thumbnails),
      publishedAt: video.snippet.publishedAt,
      durationSeconds: parseDuration(video.contentDetails.duration),
      markedAsShort: /#shorts?\b/i.test(`${video.snippet.title}\n${video.snippet.description ?? ""}`),
      embeddable: video.status?.embeddable !== false && video.status?.privacyStatus !== "private",
    }))
    .filter((video) => video.markedAsShort && video.embeddable && video.durationSeconds > 0 && video.durationSeconds <= 180)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  const shorts: YouTubeShort[] = shortCandidates.slice(0, 6).map((video) => ({
    id: video.id,
    title: video.title,
    thumbnailUrl: video.thumbnailUrl,
    publishedAt: video.publishedAt,
    durationSeconds: video.durationSeconds,
  }));
  const featuredById = new Map((featuredResponse.items ?? []).map((video) => [video.id, video]));
  const featuredVideos: YouTubeFeaturedVideo[] = FEATURED_VIDEO_IDS.flatMap((id) => {
    const video = featuredById.get(id);
    if (!video || video.status?.embeddable === false || video.status?.privacyStatus === "private") return [];
    return [{ id: video.id, title: video.snippet.title, thumbnailUrl: bestThumbnail(video.snippet.thumbnails), durationSeconds: parseDuration(video.contentDetails.duration) }];
  });
  const playlists: YouTubePlaylist[] = (playlistsResponse.items ?? []).slice(0, 6).map((playlist) => ({
    id: playlist.id,
    title: playlist.snippet.title,
    thumbnailUrl: bestThumbnail(playlist.snippet.thumbnails),
    itemCount: playlist.contentDetails.itemCount,
  }));

  return {
    channelId: channel.id,
    channelTitle: channel.snippet.title.trim(),
    channelThumbnailUrl: bestThumbnail(channel.snippet.thumbnails),
    subscriberCount: channel.statistics?.hiddenSubscriberCount ? null : Number(channel.statistics?.subscriberCount ?? 0),
    shorts,
    featuredVideos,
    playlists,
  };
}

const getCachedYouTubeContent = unstable_cache(loadYouTubeContent, ["youtube-home-content"], { revalidate: 900 });

export async function getYouTubeHomeContent(): Promise<YouTubeHomeContent | null> {
  if (contentCache && contentCache.expiresAt > Date.now()) return contentCache.value;
  if (!pendingContent) {
    pendingContent = getCachedYouTubeContent()
      .then((value) => {
        contentCache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
        return value;
      })
      .catch((error: unknown) => {
        console.error("YouTube home content could not be loaded:", error instanceof Error ? error.message : error);
        return null;
      })
      .finally(() => { pendingContent = null; });
  }
  return pendingContent;
}
