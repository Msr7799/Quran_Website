import "server-only";
import type { Filter } from "mongodb";
import { getDatabase } from "./mongodb";
import { fetchQuranData } from "./quran-data-api";
import type { Radio, Reciter, Surah, SurahMeta, SynchronizedReciter } from "./types";

type HafsSmartAyah = {
  id: number;
  jozz: number;
  sura_no: number;
  sura_name_en: string;
  sura_name_ar: string;
  page: number;
  line_start: number;
  line_end: number;
  aya_no: number;
  aya_text: string;
  aya_text_emlaey: string;
  normalizedText: string;
};

type DatasetDocument<T> = { _id: string; data: T };
type ResultResponse<T> = { success: boolean; result: T };
type DataResponse<T> = { success: boolean; data: T };

export type SurahNameAsset = {
  number: number;
  name: SurahMeta["name"];
  image_url: string;
  image_file: string;
};

export type QuranSearchResult = {
  id: number;
  surahNumber: number;
  surahName: string;
  surahNameEn: string;
  ayahNumber: number;
  text: string;
  page: number;
  juz: number;
  lineStart: number;
  lineEnd: number;
};

async function getDataset<T>(id: string) {
  const database = await getDatabase();
  const document = await database.collection<DatasetDocument<T>>("content_datasets").findOne({ _id: id });
  if (!document) throw new Error(`MongoDB dataset is missing: ${id}`);
  return document.data;
}

export async function getSurahs() {
  return (await fetchQuranData<ResultResponse<SurahMeta[]>>("surahs")).result;
}

export async function getSurah(id: number) {
  if (!Number.isInteger(id) || id < 1 || id > 114) return null;
  try {
    return (await fetchQuranData<ResultResponse<Surah>>(`surah/${id}`)).result;
  } catch {
    return null;
  }
}

export async function getReciters() {
  return (await fetchQuranData<DataResponse<Reciter[]>>("reciters")).data;
}

export async function getSynchronizedReciters() {
  const response = await fetchQuranData<DataResponse<SynchronizedReciter[]>>("ayah-bayah/reciters");
  return response.data.filter((reciter) => reciter.tracking_available && reciter.available_surahs.length > 0);
}

export async function getSurahNameAssets() {
  return (await fetchQuranData<DataResponse<SurahNameAsset[]>>("surah-names")).data;
}

export async function getRadios() {
  return (await getDataset<{ radios: Radio[] }>("radios")).radios;
}

export const getAzkar = () => getDataset<{ data: Array<{ id: number; category: string; zekr: string; reference: string }> }>("azkar");
export const getCollections = () => getDataset<Array<{ bookNumber: number; bookName: string; aboutBook: string; parts_count: number }>>("collections");
export const getReligiousEvents = () => getDataset<{ data: Array<{ id: number; title: string; month: number; day: number[]; isReminder: boolean; isLottie: boolean; isSvg: boolean; lottiePath: string; svgPath: string; hadith: Array<{ hadith: string; bookInfo: string }> }> }>("religious-events");
export const getLibraryBooks = () => getDataset<unknown>("library-books");

export async function getAudioSources(surah: number) {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) return null;
  const response = await fetchQuranData<ResultResponse<Array<{ id: number; link: string }>>>(`audio/${surah}`);
  return { _id: surah, items: response.result };
}

export function normalizeQuranSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .toLocaleLowerCase("ar")
    .replace(/\s+/g, " ")
    .trim();
}

export async function searchQuran(query: string, limit = 80) {
  const clean = normalizeQuranSearch(query);
  if (clean.length < 2) return [];
  const database = await getDatabase();
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter: Filter<HafsSmartAyah> = { normalizedText: { $regex: escaped } };
  const ayahs = await database.collection<HafsSmartAyah>("quran_search").find(filter).sort({ id: 1 }).limit(limit).toArray();
  return ayahs.map((ayah): QuranSearchResult => ({
    id: ayah.id,
    surahNumber: ayah.sura_no,
    surahName: ayah.sura_name_ar,
    surahNameEn: ayah.sura_name_en,
    ayahNumber: ayah.aya_no,
    text: ayah.aya_text_emlaey,
    page: ayah.page,
    juz: ayah.jozz,
    lineStart: ayah.line_start,
    lineEnd: ayah.line_end,
  }));
}
