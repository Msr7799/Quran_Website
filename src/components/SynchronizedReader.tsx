// المسار: src/components/SynchronizedReader.tsx — يزامن عرض آيات السورة وكلماتها مع التلاوة.
"use client";

import { Download, LoaderCircle, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Surah, SurahMeta, SynchronizedReciter } from "@/lib/types";
import { ReciterAvatar } from "@/components/ReciterAvatar";
import { localeInfo, useLocale } from "@/i18n/LocaleProvider";
import { toArabicNumber } from "@/lib/numbers";
import { SelectDropdown } from "@/components/ui/dropdown-menu";
import { VerseActions } from "./VerseActions";
import { TafsirButton } from "./TafsirButton";

type WordTiming = [word: number, timestampFrom: number, timestampTo: number];
type Timing = { ayah: number; timestamp_from: number; timestamp_to: number; segments?: WordTiming[] };
type AudioTrack = { ayah: number; audioUrl: string; timestamp_from: number; timestamp_to: number; duration: number };
type Recitation = { audioMode: "surah" | "ayah"; audioUrl: string; duration: number; tracks: AudioTrack[]; segments: Timing[]; estimated: boolean };
type Translation = { locale: string; surah: number; verses: Array<{ verse: number; text: string }>; author: string; source: string; repository: string };
const EMPTY_TRACKS: AudioTrack[] = [];
const VERSES_PER_BATCH = 20;
const RECITER_STORAGE_KEY = "alquran-reader-reciter";
const PROGRESS_STORAGE_KEY = "alquran-reader-progress";
// يحوّل زمن الصوت إلى صيغة دقائق وثوانٍ.
const format = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;

// يدير مزامنة النص والترجمة والتلاوة والتنقل بين الآيات.
export function SynchronizedReader({ surah, surahs, reciters }: { surah: Surah; surahs: SurahMeta[]; reciters: SynchronizedReciter[] }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [reciter, setReciter] = useState("101");
  const [data, setData] = useState<Recitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState(false);
  const [visibleVerseCount, setVisibleVerseCount] = useState(VERSES_PER_BATCH);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const loadMoreVerse = useRef<HTMLElement>(null);
  const pendingLocalTime = useRef<number | null>(null);
  const pendingPlay = useRef(false);
  const resumePendingAyah = useRef<number | null>(null);
  useEffect(() => {
    const savedReciter = localStorage.getItem(RECITER_STORAGE_KEY);
    queueMicrotask(() => {
      if (savedReciter && reciters.some((item) => String(item.id) === savedReciter)) setReciter(savedReciter);
      setPreferencesLoaded(true);
    });
  }, [reciters]);
  useEffect(() => {
    if (preferencesLoaded) localStorage.setItem(RECITER_STORAGE_KEY, reciter);
  }, [preferencesLoaded, reciter]);
  useEffect(() => {
    if (!preferencesLoaded) return;
    const controller = new AbortController();
    let active = true;
    // Loading state is intentionally reset whenever the selected reciter changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setPlaying(false); setCurrentTime(0); setData(null); setActiveTrackIndex(0);
    pendingLocalTime.current = null; pendingPlay.current = false;
    fetch(`/api/recitation/${reciter}/${surah.number}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("recitation"); return response.json(); })
      .then((value: Recitation) => { if (active) { setData(value); setDuration(value.duration); setActiveTrackIndex(0); } })
      .catch((reason: unknown) => {
        if ((reason as { name?: string })?.name !== "AbortError" && active) setData(null);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [preferencesLoaded, reciter, surah.number]);
  useEffect(() => {
    if (locale === "ar") return;
    const controller = new AbortController();
    let active = true;
    // Reset the visible translation whenever the selected language or surah changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTranslationLoading(true); setTranslationError(false);
    fetch(`/api/quran-translation/${locale}/${surah.number}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("translation"); return response.json(); })
      .then((value: Translation) => { if (active) setTranslation(value); })
      .catch((reason: unknown) => {
        if ((reason as { name?: string })?.name !== "AbortError" && active) setTranslationError(true);
      })
      .finally(() => { if (active) setTranslationLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [locale, surah.number]);
  const activeTranslation = translation?.locale === locale && translation.surah === surah.number ? translation : null;
  const translatedVerses = useMemo(() => new Map(activeTranslation?.verses.map((verse) => [verse.verse, verse.text]) ?? []), [activeTranslation]);
  const tracks = data?.tracks ?? EMPTY_TRACKS;
  const activeTrack = data?.audioMode === "ayah" ? tracks[activeTrackIndex] : null;
  const audioSource = activeTrack?.audioUrl ?? data?.audioUrl;
  const currentTiming = useMemo(() => data?.segments.find((segment) => currentTime * 1000 >= segment.timestamp_from && currentTime * 1000 < segment.timestamp_to), [currentTime, data]);
  const currentAyah = currentTiming?.ayah ?? 0;
  const currentWord = useMemo(() => {
    const milliseconds = currentTime * 1000;
    const activeSegments = currentTiming?.segments?.filter((segment) => milliseconds >= segment[1] && milliseconds < segment[2]) ?? [];
    return activeSegments.sort((left, right) => (left[2] - left[1]) - (right[2] - right[1]))[0]?.[0] ?? 0;
  }, [currentTime, currentTiming]);
  useEffect(() => {
    if (!data) return;
    let savedAyah = 1;
    try {
      const progress = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}") as Record<string, number>;
      savedAyah = Math.max(1, Math.min(surah.verses.length, Number(progress[String(surah.number)]) || 1));
    } catch { /* Ignore malformed browser storage. */ }
    const timing = data.segments.find((item) => item.ayah === savedAyah);
    if (!timing) return;
    resumePendingAyah.current = savedAyah;
    pendingPlay.current = false;
    if (data.audioMode === "ayah") {
      const trackIndex = tracks.findIndex((track) => track.ayah === savedAyah);
      if (trackIndex >= 0) {
        pendingLocalTime.current = 0;
        queueMicrotask(() => setActiveTrackIndex(trackIndex));
      }
    } else {
      pendingLocalTime.current = timing.timestamp_from / 1000;
      if (audio.current?.readyState) audio.current.currentTime = pendingLocalTime.current;
    }
    queueMicrotask(() => setCurrentTime(timing.timestamp_from / 1000));
  }, [data, surah.number, surah.verses.length, tracks]);
  useEffect(() => {
    if (!currentAyah || (resumePendingAyah.current && currentAyah !== resumePendingAyah.current)) return;
    resumePendingAyah.current = null;
    try {
      const progress = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}") as Record<string, number>;
      progress[String(surah.number)] = currentAyah;
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      localStorage.setItem(`${PROGRESS_STORAGE_KEY}-last`, JSON.stringify({ surah: surah.number, ayah: currentAyah }));
    } catch { /* Storage can be unavailable in private browser contexts. */ }
  }, [currentAyah, surah.number]);
  const visibleVerses = surah.verses.slice(0, visibleVerseCount);
  const hasMoreVerses = visibleVerseCount < surah.verses.length;
  useEffect(() => {
    // Start each newly selected surah with one batch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleVerseCount(VERSES_PER_BATCH);
  }, [surah.number]);
  useEffect(() => {
    if (!hasMoreVerses || !loadMoreVerse.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleVerseCount((count) => Math.min(count + VERSES_PER_BATCH, surah.verses.length));
    }, { threshold: 0.15 });
    observer.observe(loadMoreVerse.current);
    return () => observer.disconnect();
  }, [hasMoreVerses, visibleVerseCount, surah.verses.length]);
  useEffect(() => {
    if (!currentAyah || currentAyah < visibleVerseCount - 1) return;
    // Audio seeking can jump beyond the currently rendered batch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleVerseCount((count) => Math.min(Math.max(count + VERSES_PER_BATCH, currentAyah + 1), surah.verses.length));
  }, [currentAyah, visibleVerseCount, surah.verses.length]);
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    // يحدّث زمن التشغيل وشريط التقدم من عنصر الصوت.
    const updateTime = () => {
      if (audio.current) {
        if (activeTrack) {
          const trackDurationMs = activeTrack.timestamp_to - activeTrack.timestamp_from;
          const localMilliseconds = Math.min(audio.current.currentTime * 1000, Math.max(0, trackDurationMs - 1));
          setCurrentTime((activeTrack.timestamp_from + localMilliseconds) / 1000);
        } else {
          setCurrentTime(audio.current.currentTime);
        }
      }
      frame = requestAnimationFrame(updateTime);
    };
    frame = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(frame);
  }, [activeTrack, playing]);
  useEffect(() => { if (!currentAyah || !playing) return; document.getElementById(`ayah-${currentAyah}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [currentAyah, playing, visibleVerseCount]);
  // يشغّل التلاوة أو يوقفها مؤقتًا.
  async function toggle() {
    if (!audio.current || !data) return;
    if (playing) audio.current.pause();
    else await audio.current.play();
    setPlaying(!playing);
  }
  // ينقل التشغيل إلى زمن محدد داخل التلاوة.
  function seekTo(globalSeconds: number, shouldPlay = playing) {
    if (!audio.current || !data) return;
    const target = Math.max(0, Math.min(duration, globalSeconds));
    setCurrentTime(target);
    if (data.audioMode === "surah") {
      audio.current.currentTime = target;
      if (shouldPlay) void audio.current.play();
      return;
    }
    const targetMs = target * 1000;
    const index = tracks.findIndex((track, trackIndex) => targetMs >= track.timestamp_from && (targetMs < track.timestamp_to || trackIndex === tracks.length - 1));
    if (index < 0) return;
    const track = tracks[index];
    const localTime = Math.max(0, (targetMs - track.timestamp_from) / 1000);
    if (index === activeTrackIndex) {
      audio.current.currentTime = localTime;
      if (shouldPlay) void audio.current.play();
    } else {
      pendingLocalTime.current = localTime;
      pendingPlay.current = shouldPlay;
      setActiveTrackIndex(index);
    }
  }
  // يتقدم أو يتراجع في التلاوة بعدد ثوانٍ.
  function skip(seconds: number) { seekTo(currentTime + seconds); }
  // ينقل التشغيل مباشرة إلى بداية آية محددة.
  function seekAyah(ayah: number) {
    const timing = data?.segments.find((item) => item.ayah === ayah);
    if (timing) seekTo(timing.timestamp_from / 1000, true);
  }
  // يحدّث الآية النشطة أثناء تقدم التلاوة.
  function handleTimeUpdate(element: HTMLAudioElement) {
    if (!activeTrack) {
      setCurrentTime(element.currentTime);
      return;
    }
    const trackDurationMs = activeTrack.timestamp_to - activeTrack.timestamp_from;
    const localMilliseconds = Math.min(element.currentTime * 1000, Math.max(0, trackDurationMs - 1));
    setCurrentTime((activeTrack.timestamp_from + localMilliseconds) / 1000);
  }
  // يعالج جاهزية الصوت ويستأنف الموضع المحفوظ.
  function handleCanPlay(element: HTMLAudioElement) {
    if (pendingLocalTime.current !== null) {
      element.currentTime = pendingLocalTime.current;
      pendingLocalTime.current = null;
    }
    if (pendingPlay.current) {
      pendingPlay.current = false;
      void element.play();
      setPlaying(true);
    }
  }
  // ينتقل إلى السورة التالية عند انتهاء التلاوة.
  function handleEnded() {
    if (data?.audioMode === "ayah" && activeTrackIndex < tracks.length - 1) {
      const nextIndex = activeTrackIndex + 1;
      pendingLocalTime.current = 0;
      pendingPlay.current = true;
      setCurrentTime(tracks[nextIndex].timestamp_from / 1000);
      setActiveTrackIndex(nextIndex);
      return;
    }
    setPlaying(false);
  }
  const isArabic = locale === "ar" || locale === "ur";
  const translationDirection = localeInfo[locale].dir;
  const activeReciter = reciters.find((item) => String(item.id) === reciter) ?? reciters[0];

  return <div className="sync-reader">
    <div className="reader-header-portrait" aria-label={`${t("quran.reciter", "القارئ")}: ${isArabic ? activeReciter.reciter.ar : activeReciter.reciter.en}`} title={isArabic ? activeReciter.reciter.ar : activeReciter.reciter.en}>
      <ReciterAvatar reciterId={activeReciter.id} name={activeReciter.reciter.ar} sizes="128px" />
    </div>
    <div className="sync-toolbar">
      <div className="reader-selectors">
        <div className="select-label"><span>{t("quran.reciter", "القارئ")}</span><SelectDropdown value={reciter} onValueChange={setReciter} ariaLabel={t("quran.reciter", "القارئ")} className="reader-reciter-trigger" contentClassName="reader-reciter-menu" options={reciters.map((item) => ({ value: String(item.id), label: <span className="reciter-option"><ReciterAvatar reciterId={item.id} name={item.reciter.ar} sizes="40px" /><span>{isArabic ? item.reciter.ar : item.reciter.en}</span></span>, searchText: `${item.reciter.ar} ${item.reciter.en}` }))} /></div>
        <div className="select-label"><span>{t("ui.chooseSurah", "اختر سورة")}</span><SelectDropdown value={String(surah.number)} onValueChange={(value) => router.push(`/quran/${value}`)} ariaLabel={t("ui.chooseSurah", "اختر سورة")} className="reader-surah-trigger" contentClassName="reader-surah-menu" options={surahs.map((item) => ({ value: String(item.number), label: <span className="reader-surah-option"><b>{item.number}</b><span>سورة {item.name.ar}</span><small>{item.name.transliteration}</small></span>, searchText: `${item.number} ${item.name.ar} ${item.name.en} ${item.name.transliteration}` }))} /></div>
        <a className="download-surah" href={`/api/recitation/${reciter}/${surah.number}?download=1`} download aria-disabled={!data || loading} onClick={(event) => { if (!data || loading) event.preventDefault(); }}><Download />{t("quran.downloadSurah", "تحميل السورة")}</a>
      </div>
      <div className="now-reading"><small>{loading ? t("common.loading", "جاري التحميل...") : currentAyah ? `${t("quran.ayah", "الآية")} ${currentAyah}` : t("quran.listen", "القراءة المتزامنة")}</small><strong>{t("quran.surah", "سورة")} {surah.name.ar}</strong>{data?.estimated && <em>Estimated synchronization</em>}</div>
    </div>
    <div className="reader-mobile-details">
      <a className="download-surah" href={`/api/recitation/${reciter}/${surah.number}?download=1`} download aria-disabled={!data || loading} onClick={(event) => { if (!data || loading) event.preventDefault(); }}><Download />{t("quran.downloadSurah", "تحميل السورة")}</a>
      <div className="now-reading"><small>{loading ? t("common.loading", "جاري التحميل...") : currentAyah ? `${t("quran.ayah", "الآية")} ${currentAyah}` : t("quran.listen", "القراءة المتزامنة")}</small><strong>{t("quran.surah", "سورة")} {surah.name.ar}</strong>{data?.estimated && <em>Estimated synchronization</em>}</div>
    </div>
    <div className="sync-verses">
      {surah.number !== 1 && surah.number !== 9 && <p className="basmala" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>}
      {visibleVerses.map((verse, index) => <section ref={hasMoreVerses && index === visibleVerses.length - 2 ? loadMoreVerse : undefined} className={currentAyah === verse.number ? "sync-verse active" : "sync-verse"} id={`ayah-${verse.number}`} key={verse.number} onClick={() => seekAyah(verse.number)}>
        <div className="verse-top"><span>{t("quran.ayah", "الآية")} {verse.number} · {t("quran.page", "الصفحة")} {verse.page}</span><div className="verse-tools"><TafsirButton surah={surah.number} ayah={verse.number} surahName={surah.name.ar} arabicText={verse.text.ar} /><VerseActions text={`${verse.text.ar} ${toArabicNumber(verse.number)} — سورة ${surah.name.ar}`} /></div></div>
        {locale !== "ar" && translatedVerses.has(verse.number) && <p className="translation" lang={locale} dir={translationDirection} data-no-translate>{translatedVerses.get(verse.number)}</p>}
        <p className="arabic-verse" lang="ar" dir="rtl">{verse.text.ar.trim().split(/\s+/).map((word, wordIndex, words) => <span className={currentAyah === verse.number && currentWord === wordIndex + 1 ? "recited-word active" : "recited-word"} key={`${verse.number}-${wordIndex}`}>{word}{wordIndex < words.length - 1 ? " " : ""}</span>)}<b className="ayah-number" dir="rtl" aria-label={`الآية ${verse.number}`}>{toArabicNumber(verse.number)}</b></p>
      </section>)}
      {locale !== "ar" && <div className={`translation-credit${translationError ? " error" : ""}`} data-no-translate>
        {translationLoading ? t("common.loading", "جاري تحميل الترجمة...") : translationError ? "تعذر تحميل ترجمة الآيات." : activeTranslation ? <a href={activeTranslation.source} target="_blank" rel="noreferrer">{activeTranslation.author} · {activeTranslation.repository}</a> : null}
      </div>}
    </div>
    <div className="sync-player"><audio ref={audio} src={audioSource} muted={muted} preload="metadata" onLoadedMetadata={(event) => { if (data?.audioMode !== "ayah") setDuration(event.currentTarget.duration); }} onCanPlay={(event) => handleCanPlay(event.currentTarget)} onTimeUpdate={(event) => handleTimeUpdate(event.currentTarget)} onPause={() => { if (!pendingPlay.current) setPlaying(false); }} onEnded={handleEnded} /><button onClick={() => setMuted(!muted)}>{muted ? <VolumeX /> : <Volume2 />}</button><button onClick={() => skip(-10)} aria-label="الرجوع 10 ثوانٍ"><RotateCw /></button><button className="main-play" onClick={toggle} disabled={loading || !data}>{loading ? <LoaderCircle className="spin" /> : playing ? <Pause /> : <Play />}</button><button onClick={() => skip(10)} aria-label="التقديم 10 ثوانٍ"><RotateCcw /></button><span>{format(currentTime)}</span><input aria-label="موضع التلاوة" type="range" min="0" max={duration || 1} step="0.1" value={currentTime} onChange={(event) => seekTo(Number(event.target.value), false)} /><span>{format(duration)}</span></div>
  </div>;
}
