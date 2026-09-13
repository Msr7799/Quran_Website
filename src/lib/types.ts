export type Localized = { ar: string; en: string };

export type Verse = {
  number: number;
  text: Localized;
  juz: number;
  page: number;
  sajda: boolean;
};

export type SurahMeta = {
  number: number;
  name: Localized & { transliteration: string };
  revelation_place: Localized;
  verses_count: number;
  words_count: number;
  letters_count: number;
};

export type Surah = SurahMeta & { verses: Verse[] };

export type Reciter = {
  id: number;
  reciter: Localized;
  rewaya: Localized;
  server: string;
  link?: string;
  image?: { file: string | null; url: string | null };
  image_url?: string | null;
};

export type SynchronizedReciter = Reciter & {
  slug: string;
  name: string;
  recitation_type: "surah-by-surah" | "ayah-by-ayah";
  tracking_available: boolean;
  available_surahs: number[];
};

export type Radio = { id: number; name: string; url: string };
