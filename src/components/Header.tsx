// المسار: src/components/Header.tsx — يعرض رأس الموقع وأدوات التنقل والبحث والمظهر.
"use client";

import Image from "next/image";
import { cloudinaryAsset } from "@/lib/cloudinary-assets";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsLeft, ChevronsRight, ChevronsUp, Grip, Languages, Menu, Search, X } from "lucide-react";
import { CSSProperties, FormEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { navigation } from "./icons";
import { localeInfo, useLocale } from "@/i18n/LocaleProvider";
import { LottiePlayer } from "./LottiePlayer";

type MobileRailDock = "bottom" | "left" | "right" | "floating";
type MobileRailPlacement = { dock: MobileRailDock; x: number; y: number };

const defaultRailPlacement: MobileRailPlacement = { dock: "bottom", x: 12, y: 120 };

// يدير قائمة التنقل والبحث وتبديل المظهر.
export function Header() {
  const pathname = usePathname(); const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [menu, setMenu] = useState(false); const [languagesOpen, setLanguagesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); const [dark, setDark] = useState(true); const [query, setQuery] = useState("");
  const [navigating, setNavigating] = useState(false);
  const [railPlacement, setRailPlacement] = useState<MobileRailPlacement>(defaultRailPlacement);
  const [railDragging, setRailDragging] = useState(false);
  const railRef = useRef<HTMLElement>(null);
  const railDrag = useRef<{ pointerId: number; offsetX: number; offsetY: number; width: number; height: number } | null>(null);
  const touchStart = useRef<{ x: number; y: number; dock: MobileRailDock; startedOnRail: boolean } | null>(null);
  useEffect(() => { const saved = localStorage.getItem("theme"); const value = saved ? saved === "dark" : true; queueMicrotask(() => setDark(value)); document.documentElement.dataset.theme = value ? "dark" : "light"; document.documentElement.style.colorScheme = value ? "dark" : "light"; }, []);
  useEffect(() => { queueMicrotask(() => setNavigating(false)); }, [pathname]);
  useEffect(() => {
    const saved = localStorage.getItem("mobile-navigation-placement");
    if (!saved) return;
    try {
      const placement = JSON.parse(saved) as Partial<MobileRailPlacement>;
      if (["bottom", "left", "right", "floating"].includes(placement.dock ?? "") && Number.isFinite(placement.x) && Number.isFinite(placement.y)) {
        queueMicrotask(() => setRailPlacement(placement as MobileRailPlacement));
      }
    } catch { localStorage.removeItem("mobile-navigation-placement"); }
  }, []);
  useEffect(() => {
    if (!menu || !railRef.current || !window.matchMedia("(max-width: 780px)").matches) return;
    const rail = railRef.current;
    let hideTimer = window.setTimeout(() => setMenu(false), 5000);
    // يعيد احتساب مهلة إخفاء القائمة عند لمسها أو تحريكها.
    const restartHideTimer = () => {
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setMenu(false), 5000);
    };
    rail.addEventListener("pointerdown", restartHideTimer, { passive: true });
    rail.addEventListener("pointermove", restartHideTimer, { passive: true });
    rail.addEventListener("click", restartHideTimer, { passive: true });
    return () => {
      window.clearTimeout(hideTimer);
      rail.removeEventListener("pointerdown", restartHideTimer);
      rail.removeEventListener("pointermove", restartHideTimer);
      rail.removeEventListener("click", restartHideTimer);
    };
  }, [menu]);
  useEffect(() => {
    // يبدأ تتبع السحب من الحافة المرتبطة بموضع القائمة أو من القائمة المفتوحة.
    const onTouchStart = (event: TouchEvent) => {
      if (!window.matchMedia("(max-width: 780px)").matches) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const startedOnRail = railRef.current?.contains(event.target as Node) ?? false;
      const startsAtDock = railPlacement.dock === "left"
        ? touch.clientX <= 90
        : railPlacement.dock === "right"
          ? touch.clientX >= window.innerWidth - 90
          : railPlacement.dock === "floating"
            ? touch.clientX >= railPlacement.x - 12 && touch.clientX <= railPlacement.x + 90 && touch.clientY >= railPlacement.y - 12 && touch.clientY <= railPlacement.y + 90
            : touch.clientY >= window.innerHeight - 120;
      touchStart.current = startsAtDock || startedOnRail
        ? { x: touch.clientX, y: touch.clientY, dock: railPlacement.dock, startedOnRail }
        : null;
    };

    // يفتح القائمة باتجاه داخل الشاشة ويغلقها بعكس اتجاه الفتح.
    const onTouchEnd = (event: TouchEvent) => {
      const start = touchStart.current;
      const touch = event.changedTouches[0];
      touchStart.current = null;
      if (!start || !touch) return;
      const horizontalDistance = touch.clientX - start.x;
      const verticalDistance = touch.clientY - start.y;
      const mainDistance = start.dock === "left"
        ? horizontalDistance
        : start.dock === "right"
          ? -horizontalDistance
          : -verticalDistance;
      const crossDistance = start.dock === "left" || start.dock === "right" ? verticalDistance : horizontalDistance;
      if (Math.abs(mainDistance) < 45 || Math.abs(mainDistance) <= Math.abs(crossDistance) * 1.2) return;
      if (mainDistance > 0) {
        setMenu(true);
      } else if (start.startedOnRail) {
        setMenu(false);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [railPlacement]);
  // يحفظ موضع القائمة المختار لاستخدامه في الزيارة التالية.
  function saveRailPlacement(placement: MobileRailPlacement) {
    setRailPlacement(placement);
    localStorage.setItem("mobile-navigation-placement", JSON.stringify(placement));
  }
  // يبدأ تحرير موضع قائمة التنقل من مقبض السحب.
  function startRailDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!window.matchMedia("(max-width: 780px)").matches || !railRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    const bounds = railRef.current.getBoundingClientRect();
    railDrag.current = { pointerId: event.pointerId, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top, width: bounds.width, height: bounds.height };
    event.currentTarget.setPointerCapture(event.pointerId);
    setRailDragging(true);
  }
  // يحرّك القائمة بحرية داخل حدود الشاشة أثناء السحب.
  function moveRail(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = railDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const floatingWidth = Math.min(240, window.innerWidth - 16);
    const x = Math.max(8, Math.min(window.innerWidth - floatingWidth - 8, event.clientX - Math.min(drag.offsetX, floatingWidth - 24)));
    const y = Math.max(8, Math.min(window.innerHeight - drag.height - 8, event.clientY - drag.offsetY));
    setRailPlacement({ dock: "floating", x, y });
  }
  // يثبت القائمة عند أقرب حافة أو يتركها عائمة في موضعها الحالي.
  function finishRailDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = railDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    railDrag.current = null;
    setRailDragging(false);
    const snapDistance = 72;
    const placement = event.clientX <= snapDistance
      ? { dock: "left" as const, x: 0, y: 0 }
      : event.clientX >= window.innerWidth - snapDistance
        ? { dock: "right" as const, x: 0, y: 0 }
        : event.clientY >= window.innerHeight - 96
          ? { dock: "bottom" as const, x: 0, y: 0 }
          : railPlacement;
    saveRailPlacement(placement);
  }
  // ينهي السحب الملغى مع الاحتفاظ بآخر موضع آمن للقائمة.
  function cancelRailDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (railDrag.current?.pointerId !== event.pointerId) return;
    railDrag.current = null;
    setRailDragging(false);
    saveRailPlacement(railPlacement);
  }
  // يبدّل بين المظهر الفاتح والداكن ويحفظ الاختيار.
  function toggleTheme() { const value = !dark; setDark(value); document.documentElement.dataset.theme = value ? "dark" : "light"; document.documentElement.style.colorScheme = value ? "dark" : "light"; localStorage.setItem("theme", value ? "dark" : "light"); }
  // ينقل المستخدم إلى صفحة نتائج البحث.
  function search(event: FormEvent) { event.preventDefault(); if (query.trim()) { router.push(`/search/${encodeURIComponent(query.trim())}`); setSearchOpen(false); } }
  // يبني عنصر تنقل واحدًا مع إبقاء الصفحة الحالية مميزة داخل الشريط.
  function renderRailItem(item: (typeof navigation)[number]) {
    const Icon = item.icon;
    const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    const label = t(item.translationKey, item.label);
    return active
      ? <button className="active" type="button" data-label={label} aria-label={label} key={item.href}><Icon /></button>
      : <Link href={item.href} prefetch={false} onClick={() => { setNavigating(true); setMenu(false); }} data-label={label} aria-label={label} key={item.href}><Icon /></Link>;
  }
  const basmala = <>
    <Image className="basmala-image basmala-light" src={cloudinaryAsset("/images/basmalh-light.svg")} width={520} height={120} loading="eager" style={{ width: "100%", height: "auto" }} alt="" />
    <Image className="basmala-image basmala-dark" src={cloudinaryAsset("/images/basmalh-dark.svg")} width={520} height={120} loading="eager" style={{ width: "100%", height: "auto" }} alt="" />
  </>;
  return <>
    <header className={pathname === "/" ? "basmala-header home-basmala-header" : "basmala-header"}>{pathname === "/" ? <span aria-label="القرآن المجيد">{basmala}</span> : <Link href="/" prefetch={false} aria-label="القرآن المجيد">{basmala}</Link>}</header>
    <button className="site-logo" type="button" onClick={() => setMenu((value) => !value)} aria-label="فتح القائمة الرئيسية" aria-expanded={menu}><Image src={cloudinaryAsset("/alf.png")} width={1028} height={884} alt="شعار القرآن المجيد" priority /></button>
    <button className="language-orb" onClick={() => setLanguagesOpen(!languagesOpen)} aria-label="اختيار اللغة"><Languages /><small>{locale.toUpperCase()}</small></button>
    {languagesOpen && <aside className="language-panel"><header><strong>اختر اللغة / Select Language</strong><button onClick={() => setLanguagesOpen(false)}><X /></button></header><div>{Object.entries(localeInfo).map(([code, language]) => <button className={locale === code ? "selected" : ""} onClick={() => { setLocale(code as keyof typeof localeInfo); setLanguagesOpen(false); }} key={code}><span>{locale === code && <Check />}</span><strong>{language.native}<small>{language.english}</small></strong><b>{language.flag}</b></button>)}</div><footer>متوفر بـ 15 لغة · Powered by next-intl</footer></aside>}
    <button className="rail-trigger" onClick={() => setMenu(!menu)} aria-label="القائمة">{menu ? <X /> : <Menu />}</button>
    {!menu && <div className="mobile-rail-swipe-hint" data-dock={railPlacement.dock} style={{ "--mobile-rail-x": `${railPlacement.x}px`, "--mobile-rail-y": `${railPlacement.y}px` } as CSSProperties} aria-hidden="true">{railPlacement.dock === "left" ? <ChevronsRight /> : railPlacement.dock === "right" ? <ChevronsLeft /> : <ChevronsUp />}</div>}
    <aside ref={railRef} className={menu ? `floating-rail open${railDragging ? " dragging" : ""}` : "floating-rail"} data-dock={railPlacement.dock} style={{ "--mobile-rail-x": `${railPlacement.x}px`, "--mobile-rail-y": `${railPlacement.y}px` } as CSSProperties}>
      <button className="rail-drag-handle" type="button" onPointerDown={startRailDrag} onPointerMove={moveRail} onPointerUp={finishRailDrag} onPointerCancel={cancelRailDrag} aria-label="تحريك قائمة التنقل" title="اسحب لتحريك القائمة"><Grip /></button>
      {renderRailItem(navigation[0])}
      <div className="rail-scroll" role="navigation" aria-label={t("common.navigation", "روابط الموقع")}>
        <button onClick={() => setSearchOpen(true)} data-label={t("common.search", "البحث")} aria-label={t("common.search", "البحث")}><Image className="rail-local-icon" src="/svg/search_icon.webp" width={33} height={33} alt="" aria-hidden="true" /></button>
        {navigation.slice(1).map(renderRailItem)}
      </div>
      <button className="theme-rail" onClick={toggleTheme} data-label="تبديل المظهر" aria-label="تبديل المظهر"><LottiePlayer className="rail-theme-animation" src={dark ? "/lottie/sun.json" : "/lottie/moon.json"} /></button>
    </aside>
    {navigating && <div className="route-loading-overlay" role="status" aria-live="polite"><span><LottiePlayer className="route-loading-animation" src="/lottie/loading.json" /></span><strong>{t("common.loading", "جاري التحميل...")}</strong></div>}
    {searchOpen && <div className="search-overlay" onClick={() => setSearchOpen(false)}><form onSubmit={search} onClick={(e) => e.stopPropagation()}><button type="button" onClick={() => setSearchOpen(false)}><X /></button><Search /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("homepage.searchPlaceholder", "ابحث في القرآن الكريم...")} /><button className="search-submit">{t("common.search", "بحث")}</button></form></div>}
  </>;
}
