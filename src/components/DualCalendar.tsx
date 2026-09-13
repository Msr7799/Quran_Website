// المسار: src/components/DualCalendar.tsx — يعرض التقويمين الميلادي والهجري مع المناسبات الدينية.
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Fragment, useMemo, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { LottiePlayer } from "@/components/LottiePlayer";

export type ReligiousEvent = { id: number; key: string; title: string; month: number; day: number[]; hadith: string; bookInfo: string; isReminder: boolean; visual?: { type: "lottie" | "svg"; src: string } };
const hijriNumeric = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" });

// يعرض أجزاء التاريخ مع تنسيق الأرقام.
function FormattedDate({ formatter, date }: { formatter: Intl.DateTimeFormat; date: Date }) {
  return <>{formatter.formatToParts(date).map((part, index) => <Fragment key={`${part.type}-${index}`}>{["day", "year"].includes(part.type) ? <span className="number-font">{part.value}</span> : part.value}</Fragment>)}</>;
}
// يستخرج اليوم والشهر الهجريين من التاريخ.
function hijriParts(date: Date) { const parts = hijriNumeric.formatToParts(date); return { day: Number(parts.find((part) => part.type === "day")?.value), month: Number(parts.find((part) => part.type === "month")?.value) }; }
function EventVisual({ event }: { event: ReligiousEvent }) { if (!event.visual) return null; return <span className="calendar-event-visual" aria-hidden="true">{event.visual.type === "lottie" ? <LottiePlayer src={event.visual.src} /> : <Image src={event.visual.src} width={76} height={76} alt="" />}</span>; }

// يبني التقويم المزدوج ويربط الأيام بالمناسبات.
export function DualCalendar({ events }: { events: ReligiousEvent[] }) {
  const { locale, t } = useLocale();
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(() => today);
  const localeTag = locale === "ar" ? "ar-BH" : locale;
  const gregorian = useMemo(() => new Intl.DateTimeFormat(localeTag, { month: "long", year: "numeric", calendar: "gregory" }), [localeTag]);
  const hijriTitle = useMemo(() => new Intl.DateTimeFormat(`${localeTag}-u-ca-islamic-umalqura`, { month: "long", year: "numeric" }), [localeTag]);
  const fullGregorian = useMemo(() => new Intl.DateTimeFormat(localeTag, { weekday: "long", day: "numeric", month: "long", year: "numeric" }), [localeTag]);
  const fullHijri = useMemo(() => new Intl.DateTimeFormat(`${localeTag}-u-ca-islamic-umalqura`, { day: "numeric", month: "long", year: "numeric" }), [localeTag]);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, day) => new Intl.DateTimeFormat(localeTag, { weekday: "long" }).format(new Date(2024, 0, 7 + day))), [localeTag]);
  const days = useMemo(() => {
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return Array.from({ length: count }, (_, index) => { const date = new Date(cursor.getFullYear(), cursor.getMonth(), index + 1); const islamic = hijriParts(date); return { date, islamic, events: events.filter((event) => event.month === islamic.month && event.day.includes(islamic.day)) }; });
  }, [cursor, events]);
  const selectedEvents = days.flatMap((day) => day.events.map((event) => ({ ...event, date: day.date })));
  const selectedDay = days.find((day) => day.date.toDateString() === selected.toDateString());
  const displayHijriMonth = hijriParts(new Date(cursor.getFullYear(), cursor.getMonth(), 15)).month;
  // ينقل التقويم إلى شهر سابق أو لاحق.
  const move = (months: number) => setCursor((value) => { const next = new Date(value.getFullYear(), value.getMonth() + months, 1); setSelected(next); return next; });

  return <div className="dual-calendar">
    <header className="calendar-toolbar"><button onClick={() => move(-1)} aria-label="الشهر السابق"><ChevronRight /></button><div className="calendar-title"><Image className="calendar-hijri-mark" src={`/svg/hijri/${displayHijriMonth}.svg`} width={68} height={68} alt="" aria-hidden="true" /><div><h2><FormattedDate formatter={gregorian} date={cursor} /></h2><p><FormattedDate formatter={hijriTitle} date={cursor} /> — <FormattedDate formatter={hijriTitle} date={new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)} /></p></div></div><button onClick={() => move(1)} aria-label="الشهر التالي"><ChevronLeft /></button></header>
    <div className="calendar-weekdays">{weekdays.map((day) => <strong key={day}>{day}</strong>)}</div>
    <div className="calendar-grid" style={{ "--first-day": days[0]?.date.getDay() + 1 } as React.CSSProperties}>{days.map(({ date, islamic, events: dayEvents }) => { const current = date.toDateString() === today.toDateString(); const active = date.toDateString() === selected.toDateString(); return <button type="button" onClick={() => setSelected(date)} aria-pressed={active} aria-label={`${date.getDate()}`} className={`${current ? "today " : ""}${active ? "selected " : ""}${dayEvents.length ? "has-event" : ""}`} key={date.toISOString()}><b className="number-font">{date.getDate()}</b><span><span className="number-font">{islamic.day}</span> هـ</span>{dayEvents.map((event) => <small key={event.id}>{event.title}</small>)}</button>; })}</div>
    {selectedDay && <section className="selected-day-panel"><header><span>{t("ui.selectedDay", "اليوم المحدد")}</span><h2><FormattedDate formatter={fullGregorian} date={selectedDay.date} /></h2><p><FormattedDate formatter={fullHijri} date={selectedDay.date} /></p></header>{selectedDay.events.length ? selectedDay.events.map((event) => <article key={event.id}><EventVisual event={event} /><div><h3>{event.title}</h3><p>{event.hadith}</p>{event.bookInfo && <small>{event.bookInfo}</small>}</div></article>) : <p className="empty-events">{t("ui.noDayEvent", "لا توجد مناسبة دينية مسجلة في هذا اليوم.")}</p>}</section>}
    <section className="calendar-events"><h2>{t("ui.monthEvents", "مناسبات هذا الشهر")}</h2>{selectedEvents.length ? selectedEvents.map((event) => <article key={`${event.id}-${event.date.toISOString()}`}><header><div className="calendar-event-heading"><EventVisual event={event} /><div><h3>{event.title}</h3><span><FormattedDate formatter={fullGregorian} date={event.date} /></span></div></div>{event.isReminder && <b>{t("ui.reminder", "تذكير")}</b>}</header><p>{event.hadith}</p>{event.bookInfo && <small>{event.bookInfo}</small>}</article>) : <p className="empty-events">{t("ui.noMonthEvent", "لا توجد مناسبة مسجلة في هذا الشهر.")}</p>}</section>
  </div>;
}
