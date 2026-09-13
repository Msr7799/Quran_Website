import "server-only";

const DEFAULT_API_BASE_URL = "https://msr-quran-data.vercel.app/api";
const REVALIDATE_SECONDS = 86_400;

function apiBaseUrl() {
  return (process.env.QURAN_DATA_API_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function quranDataApiUrl(path: string) {
  return `${apiBaseUrl()}/${path.replace(/^\/+/, "")}`;
}

export function quranDataAssetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = new URL(apiBaseUrl()).origin;
  return new URL(path.startsWith("/") ? path : `/${path}`, origin).toString();
}

export async function fetchQuranData<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(quranDataApiUrl(path), {
    ...init,
    headers: { Accept: "application/json", ...init.headers },
    next: { revalidate: REVALIDATE_SECONDS, ...init.next },
  });

  if (!response.ok) {
    throw new Error(`Quran Data API request failed (${response.status}): ${path}`);
  }

  return response.json() as Promise<T>;
}
