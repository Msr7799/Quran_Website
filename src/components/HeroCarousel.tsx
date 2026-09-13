// المسار: src/components/HeroCarousel.tsx — يعرض وسائط الواجهة الرئيسية في شريط متحرك.
"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type HeroCarouselProps = {
  desktopMedia: string[];
  mobileMedia: string[];
};

type HeroVideoProps = {
  active: boolean;
  label: string;
  onEnded: () => void;
  playing: boolean;
  preload: "auto" | "metadata";
  src: string;
};

type DeviceMode = "desktop" | "mobile";

// يتحقق مما إذا كان ملف الوسائط مقطع فيديو.
function isVideo(src: string) {
  return /\.mp4(?:\?|$)/i.test(src);
}

// يعرض فيديو الواجهة ويتحكم في تشغيله حسب حالة الشريحة.
function HeroVideo({ active, label, onEnded, playing, preload, src }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!active) {
      video.pause();
      video.currentTime = 0;
    }
  }, [active]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active) return;

    if (playing) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active, playing]);

  return (
    <video
      ref={videoRef}
      className={active ? "active" : ""}
      src={src}
      autoPlay={active && playing}
      muted
      playsInline
      preload={preload}
      onEnded={onEnded}
      aria-label={label}
    />
  );
}

// يدير الوسائط المتجاوبة والتنقل بين الشرائح.
export function HeroCarousel({ desktopMedia, mobileMedia }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  // لا نفترض Desktop أثناء SSR. الانتظار حتى matchMedia يمنع الهاتف من طلب
  // وسائط سطح المكتب ثم استبدالها بوسائط الهاتف بعد hydration.
  const [deviceMode, setDeviceMode] = useState<DeviceMode | null>(null);

  const mobileSlides = mobileMedia.length > 0 ? mobileMedia : desktopMedia;
  const desktopSlides = desktopMedia.length > 0 ? desktopMedia : mobileMedia;
  const slides = deviceMode === "mobile" ? mobileSlides : deviceMode === "desktop" ? desktopSlides : [];

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");

    const update = () => {
      const nextMode: DeviceMode = media.matches ? "mobile" : "desktop";
      const slideCount = nextMode === "mobile" ? mobileSlides.length : desktopSlides.length;

      setDeviceMode(nextMode);
      setIndex((value) => slideCount > 0 ? value % slideCount : 0);
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [desktopSlides.length, mobileSlides.length]);

  useEffect(() => {
    const activeSlide = slides[index];
    if (!playing || slides.length < 2 || !activeSlide || isVideo(activeSlide)) return;

    const timer = window.setTimeout(() => setIndex((value) => (value + 1) % slides.length), 7000);
    return () => window.clearTimeout(timer);
  }, [slides, index, playing]);

  // نحافظ فقط على الشريحة الحالية وجارتيها. هكذا تبقى حركة الـcross-fade
  // كما هي، لكن بقية الصور والفيديوهات لا تدخل DOM ولا يبدأ تحميلها.
  const mountedIndices = useMemo(() => {
    const result = new Set<number>();
    if (slides.length === 0) return result;

    result.add(index);
    if (slides.length > 1) {
      result.add((index - 1 + slides.length) % slides.length);
      result.add((index + 1) % slides.length);
    }
    return result;
  }, [index, slides.length]);

  // ينتقل إلى الشريحة السابقة.
  const previous = () => setIndex((value) => slides.length > 0 ? (value - 1 + slides.length) % slides.length : 0);
  // ينتقل إلى الشريحة التالية.
  const next = () => setIndex((value) => slides.length > 0 ? (value + 1) % slides.length : 0);

  return (
    <section className="visual-hero" aria-label="صور القرآن الكريم">
      <div className="visual-slides">
        {slides.map((src, item) => {
          if (!mountedIndices.has(item)) return null;

          const active = item === index;
          const className = active ? "active" : "";
          const label = `صورة روحانية للقرآن الكريم ${item + 1}`;

          return isVideo(src) ? (
            <HeroVideo
              src={src}
              active={active}
              playing={playing}
              // الفيديو الحالي فقط يأخذ auto. الفيديوان المجاوران يحملان metadata
              // صغيرة للاستعداد للانتقال من دون تنزيل كل فيديوهات الـHero.
              preload={active ? "auto" : "metadata"}
              label={label}
              onEnded={() => {
                if (item === index && playing) next();
              }}
              key={src}
            />
          ) : (
            <Image
              className={className}
              src={src}
              fill
              sizes="100vw"
              // الشريحة الحالية فقط Eager/High، والجارتان Lazy/Low.
              loading={active ? "eager" : "lazy"}
              fetchPriority={active ? "high" : "low"}
              preload={active && index === 0}
              unoptimized={src.endsWith(".gif")}
              alt={label}
              key={src}
            />
          );
        })}
      </div>
      <div className="visual-shade" />
      <div className="carousel-controls">
        <button type="button" onClick={next} aria-label="الصورة التالية"><ChevronLeft /></button>
        <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "إيقاف العرض" : "تشغيل العرض"}>{playing ? <Pause /> : <Play />}</button>
        <button type="button" onClick={previous} aria-label="الصورة السابقة"><ChevronRight /></button>
      </div>
      <div className="carousel-dots">
        {slides.map((src, item) => <button type="button" className={item === index ? "active" : ""} onClick={() => setIndex(item)} key={src} aria-label={`الصورة ${item + 1}`} />)}
      </div>
    </section>
  );
}
