// المسار: src/components/MushafViewer.tsx — يعرض صفحات المصحف مع التنقل والتلاوة الصوتية.
"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { ChevronLeft, ChevronRight, Download, GripHorizontal, LoaderCircle, Maximize, Minimize, Minus, Pause, Play, Plus, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SelectDropdown } from "@/components/ui/dropdown-menu";
import { ReciterAvatar } from "@/components/ReciterAvatar";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/LocaleProvider";

const mushaf = { url: "/api/documents/quran-tafseel", first: 7, last: 610 } as const;
const playerStateKey = "mushaf-player-minimized";
const defaultReciterId = "101";
type SurahOption = { number: number; name: string; page: number };
type AudioReciter = {
  id: number;
  reciter: { ar: string; en: string };
  rewaya: { ar: string; en: string };
  server: string;
  link: string;
};

// يحوّل زمن التشغيل إلى صيغة دقائق وثوانٍ.
function clock(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const seconds = Math.max(0, Math.floor(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

const mushafText: Record<Locale, { jump: string }> = {
  ar:{jump:"انتقل إلى سورة"},
  en:{jump:"Go to surah"},
  tr:{jump:"Sureye git"},
  fr:{jump:"Aller à la sourate"},
  es:{jump:"Ir a la sura"},
  de:{jump:"Zur Sure"},
  it:{jump:"Vai alla sura"},
  pt:{jump:"Ir para a surata"},
  ru:{jump:"Перейти к суре"},
  hi:{jump:"सूरह पर जाएँ"},
  ur:{jump:"سورت پر جائیں"},
  id:{jump:"Ke surah"},
  zh:{jump:"前往章节"},
  ja:{jump:"スーラへ移動"},
  ko:{jump:"수라로 이동"},
};

// يرسم صفحة واحدة من ملف المصحف بجودة مناسبة.
function PdfPage({ document, page, quality }: { document: PDFDocumentProxy; page: number; quality: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let task: RenderTask | undefined;
    let disposed = false;
    document.getPage(page).then((pdfPage) => {
      if (disposed || !canvas.current) return;
      const base = pdfPage.getViewport({ scale: 1 });
      const viewport = pdfPage.getViewport({ scale: quality / base.width });
      const context = canvas.current.getContext("2d", { alpha: false });
      if (!context) return;
      canvas.current.width = Math.floor(viewport.width);
      canvas.current.height = Math.floor(viewport.height);
      task = pdfPage.render({ canvas: canvas.current, canvasContext: context, viewport });
      task.promise.then(() => { if (!disposed) setReady(true); }).catch(() => undefined);
    });
    return () => { disposed = true; task?.cancel(); };
  }, [document, page, quality]);

  return <div className={`book-page ${ready ? "ready" : ""}`}><canvas ref={canvas} aria-label={`صفحة ${page} من القرآن الكريم`} /><span>{page}</span></div>;
}

// يدير تحميل المصحف والتنقل والتكبير والتلاوة.
export function MushafViewer({ page }: { page: number }) {
  const { locale, t } = useLocale();
  const labels = mushafText[locale];
  const viewer = useRef<HTMLDivElement>(null);
  const playerDrag = useDragControls();
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [current, setCurrent] = useState(Math.max(mushaf.first, Math.min(mushaf.last, page)));
  const [input, setInput] = useState(Math.max(mushaf.first, Math.min(mushaf.last, page)));
  const [zoom, setZoom] = useState(100);
  const [direction, setDirection] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState(false);
  const [surahs, setSurahs] = useState<SurahOption[]>([]);
  const [chosenSurah, setChosenSurah] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [reciter, setReciter] = useState(defaultReciterId);
  const [audioReciters, setAudioReciters] = useState<AudioReciter[]>([]);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [playerMinimized, setPlayerMinimized] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    try {
      const minimized = window.localStorage.getItem(playerStateKey) === "true";
      queueMicrotask(() => { if (active) setPlayerMinimized(minimized); });
    } catch { /* Keep the default expanded state when storage is unavailable. */ }
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      return pdfjs.getDocument({ url: mushaf.url, wasmUrl: "/pdfjs/wasm/" }).promise;
    }).then((pdf) => { if (active) setPdfDocument(pdf); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    fetch("/api/surahs/pages?v=4", { cache: "no-store" }).then((response) => response.json()).then((items: SurahOption[]) => setSurahs(items)).catch(() => undefined);
  }, []);

  useEffect(() => {
    // يحدّث حالة ملء الشاشة عند تغيرها.
    const changed = () => setFullscreen(document.fullscreenElement === viewer.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);

  // ينتقل إلى صفحة مصحف صالحة ويحدّث الرابط.
  const go = useCallback((target: number, keepChosenSurah = false) => {
    const safe = Math.max(mushaf.first, Math.min(mushaf.last, target));
    setDirection(safe > current ? 1 : -1);
    setCurrent(safe);
    setInput(safe);
    if (!keepChosenSurah) setChosenSurah(null);
    window.history.pushState({}, "", `/quran-pages/${safe}`);
  }, [current]);

  useEffect(() => {
    // ينفّذ تنقل لوحة المفاتيح بين صفحات المصحف.
    const keys = (event: KeyboardEvent) => {
      const step = window.matchMedia("(min-width: 781px)").matches ? 2 : 1;
      if (event.key === "ArrowRight") go(current + step);
      if (event.key === "ArrowLeft") go(current - step);
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [current, go]);

  const max = mushaf.last;
  const selectedSurah = chosenSurah ?? [...surahs].reverse().find((surah) => surah.page <= current)?.number ?? "";
  const spreadStart = current === 1 ? 1 : current % 2 === 0 ? current : current - 1;
  const quality = Math.round(1100 * Math.max(1, zoom / 100));
  const selectedReciter = audioReciters.find((item) => String(item.id) === reciter) ?? audioReciters[0];
  const audioUrl = selectedReciter?.link;
  const downloadUrl = selectedSurah && selectedReciter ? `/api/audio-download/${selectedSurah}/${selectedReciter.id}` : undefined;
  const downloadLabel = locale === "ar" ? "تحميل التلاوة" : "Download recitation";
  const reciterOptions = audioReciters.map((item) => ({
    value: String(item.id),
    label: <span className="reciter-option"><ReciterAvatar reciterId={item.id} name={item.reciter.ar} sizes="40px" /><span>{locale === "ar" ? item.reciter.ar : item.reciter.en}</span></span>,
    searchText: `${item.reciter.ar} ${item.reciter.en} ${item.rewaya.ar} ${item.rewaya.en}`,
  }));
  // يحدد عدد الصفحات في خطوة التنقل حسب حجم الشاشة.
  const step = () => window.matchMedia("(min-width: 781px)").matches ? 2 : 1;
  // يفعّل وضع ملء الشاشة أو ينهيه.
  const toggleFullscreen = async () => fullscreen ? document.exitFullscreen() : viewer.current?.requestFullscreen();
  // يبدّل حجم مشغّل التلاوة ويحفظ التفضيل.
  const setPlayerSize = (minimized: boolean) => {
    setPlayerMinimized(minimized);
    try { window.localStorage.setItem(playerStateKey, String(minimized)); } catch { /* The player still works without persistence. */ }
  };
  // يغيّر القارئ ويحفظ الاختيار.
  const changeReciter = (value: string) => {
    audio.current?.pause();
    setPlaying(false);
    setAudioTime(0);
    setAudioDuration(0);
    setReciter(value);
  };

  useEffect(() => {
    if (!selectedSurah) return;
    const controller = new AbortController();
    void (async () => {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      audio.current?.pause();
      setAudioLoading(true); setPlaying(false); setAudioTime(0); setAudioDuration(0); setAudioReciters([]);
      try {
        const response = await fetch(`/api/audio-sources/${selectedSurah}`, { signal: controller.signal });
        if (!response.ok) throw new Error("recitation");
        const items = await response.json() as AudioReciter[];
        setAudioReciters(items);
        setReciter((currentReciter) => items.some((item) => String(item.id) === currentReciter) ? currentReciter : String(items[0]?.id ?? ""));
      } catch (reason) {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setAudioReciters([]);
      } finally {
        if (!controller.signal.aborted) setAudioLoading(false);
      }
    })();
    return () => controller.abort();
  }, [selectedSurah]);

  // يشغّل تلاوة الصفحة الحالية أو يوقفها مؤقتًا.
  const toggleAudio = async () => {
    const element = audio.current;
    if (!element || !audioUrl) return;
    if (!element.paused) { element.pause(); return; }
    await element.play();
  };

  return <div className="book-viewer" ref={viewer}>
    <div className="viewer-toolbar">
      <div className="zoom-tools">
        <button onClick={toggleFullscreen} aria-label="ملء الشاشة">{fullscreen ? <Minimize /> : <Maximize />}</button>
        <button onClick={() => setZoom((value) => Math.min(180, value + 10))} aria-label="تكبير"><Plus /></button>
        <span>{zoom}%</span>
        <button onClick={() => setZoom((value) => Math.max(70, value - 10))} aria-label="تصغير"><Minus /></button>
      </div>
      <div className="page-control number-font">
        <button title="الصفحة التالية" aria-label="الصفحة التالية" disabled={current >= max} onClick={() => go(current + step())}><ChevronLeft /></button>
        <span>صفحة</span>
        <form onSubmit={(event) => { event.preventDefault(); go(input); }}><input className="number-font" aria-label="رقم صفحة PDF" type="number" min={mushaf.first} max={max} value={input} onChange={(event) => setInput(Number(event.target.value))} /></form>
        <span>من {max}</span>
        <button title="الصفحة السابقة" aria-label="الصفحة السابقة" disabled={current <= mushaf.first} onClick={() => go(current - step())}><ChevronRight /></button>
      </div>
      {playerMinimized === true && <div className="mushaf-mini-player" aria-label="مشغل التلاوة المصغر">
        <SelectDropdown value={reciter} ariaLabel="اختر القارئ" options={reciterOptions} onValueChange={changeReciter} />
        <span className="mushaf-mini-time number-font" aria-label="توقيت التشغيل">{clock(audioTime)} / {clock(audioDuration)}</span>
        <button className="mushaf-mini-play" type="button" onClick={() => void toggleAudio()} disabled={!audioUrl || audioLoading} aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}>{audioLoading ? <LoaderCircle className="spin" /> : playing ? <Pause /> : <Play />}</button>
        <a className="mushaf-audio-download" href={downloadUrl} aria-disabled={!downloadUrl} aria-label={downloadLabel} title={downloadLabel}><Download /></a>
        <button type="button" onClick={() => setPlayerSize(false)} aria-label="تكبير مشغل التلاوة" title="تكبير المشغل"><Maximize /></button>
      </div>}
      <div className="surah-jump"><span>{labels.jump}</span><SelectDropdown value={String(selectedSurah)} placeholder={t("ui.chooseSurah", "اختر السورة")} ariaLabel={labels.jump} options={surahs.map((surah) => ({ value: String(surah.number), label: `${surah.number}. ${surah.name}`, searchText: `${surah.number} ${surah.name}` }))} onValueChange={(value) => { const surah = surahs.find((item) => item.number === Number(value)); if (surah) { setChosenSurah(surah.number); go(surah.page, true); } }} /></div>
    </div>

    <div className="book-stage">
      {!pdfDocument && !error && <div className="book-loading"><LoaderCircle className="spin" /><span>جاري تجهيز المصحف...</span></div>}
      {error && <div className="book-loading"><p>تعذر فتح ملف المصحف.</p><button onClick={() => location.reload()}>إعادة المحاولة</button></div>}
      {pdfDocument && <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          className="book-spread"
          key={current}
          custom={direction}
          variants={{ enter: (side: number) => ({ rotateY: side > 0 ? -82 : 82, opacity: 0 }), center: { rotateY: 0, opacity: 1 }, exit: (side: number) => ({ rotateY: side > 0 ? 82 : -82, opacity: 0 }) }}
          initial="enter" animate="center" exit="exit"
          transition={{ type: "spring", stiffness: 170, damping: 24, mass: .75 }}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={.16}
          onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 70) go(current + (info.offset.x > 0 ? step() : -step())); }}
          style={{ zoom: zoom / 100 }}
        >
          <div className="desktop-pages">
            {spreadStart + 1 <= max && spreadStart !== 1 && <PdfPage document={pdfDocument} page={spreadStart + 1} quality={quality} />}
            <PdfPage document={pdfDocument} page={spreadStart} quality={quality} />
          </div>
          <div className="mobile-page"><PdfPage document={pdfDocument} page={current} quality={quality} /></div>
        </motion.div>
      </AnimatePresence>}
    </div>

    {playerMinimized === false && <motion.aside className="mushaf-recitation-panel" drag dragControls={playerDrag} dragListener={false} dragConstraints={viewer} dragElastic={0} dragMomentum={false}>
      <div className="mushaf-player-head">
        <button className="mushaf-player-handle" type="button" onPointerDown={(event) => playerDrag.start(event)} aria-label="اسحب لتحريك مشغل التلاوة"><GripHorizontal /><span>حرّك المشغل</span></button>
        <button className="mushaf-player-minimize" type="button" onClick={() => setPlayerSize(true)} aria-label="تصغير مشغل التلاوة" title="تصغير المشغل"><Minimize /></button>
      </div>
      {selectedReciter && <div className="mushaf-reciter-identity">
        <ReciterAvatar reciterId={selectedReciter.id} name={selectedReciter.reciter.ar} sizes="76px" />
        <span><strong>{locale === "ar" ? selectedReciter.reciter.ar : selectedReciter.reciter.en}</strong><small>{locale === "ar" ? selectedReciter.rewaya.ar : selectedReciter.rewaya.en}</small></span>
      </div>}
      <SelectDropdown value={reciter} ariaLabel="اختر القارئ" options={reciterOptions} onValueChange={changeReciter} />
      <div className="mushaf-audio-controls number-font">
        <button type="button" onClick={() => { if (audio.current) audio.current.currentTime = Math.max(0, audio.current.currentTime - 10); }} aria-label="رجوع عشر ثوان"><RotateCcw /></button>
        <button className="main" type="button" onClick={() => void toggleAudio()} disabled={!audioUrl || audioLoading} aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}>{audioLoading ? <LoaderCircle className="spin" /> : playing ? <Pause /> : <Play />}</button>
        <button type="button" onClick={() => { if (audio.current) audio.current.currentTime = Math.min(audio.current.duration || 0, audio.current.currentTime + 10); }} aria-label="تقديم عشر ثوان"><RotateCw /></button>
        <a className="mushaf-audio-download" href={downloadUrl} aria-disabled={!downloadUrl} aria-label={downloadLabel} title={downloadLabel}><Download /></a>
        <Volume2 />
      </div>
      <div className="mushaf-audio-timeline number-font"><span>{clock(audioTime)}</span><input type="range" min="0" max={audioDuration || 0} step="0.1" value={audioTime} onChange={(event) => { const value = Number(event.target.value); if (audio.current) audio.current.currentTime = value; setAudioTime(value); }} aria-label="توقيت التلاوة" /><span>{clock(audioDuration)}</span></div>
    </motion.aside>}
    <audio ref={audio} src={audioUrl} onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setAudioTime(event.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} preload="metadata" aria-label={`تلاوة بصوت ${selectedReciter ? (locale === "ar" ? selectedReciter.reciter.ar : selectedReciter.reciter.en) : ""}`} />

  </div>;
}
