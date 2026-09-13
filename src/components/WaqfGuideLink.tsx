"use client";

import Image from "next/image";
import { LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LottiePlayer } from "@/components/LottiePlayer";
import { useLocale, type Locale } from "@/i18n/LocaleProvider";
import { missingWaqfDescriptions, waqfTranslations } from "@/i18n/waqfTranslations";
import styles from "./WaqfGuideLink.module.css";

type WaqfItem = { image: string; translations: Partial<Record<string, string>> };

const symbols = ["ۘ", "ۗ", "ۚ", "ۖ", "ۛ ۛ"] as const;

function explanationFor(item: WaqfItem, locale: Locale, index: number) {
  const translated = item.translations[locale];
  if (translated) {
    const match = translated.match(/^(.*?)\s*\{([\s\S]+)\}[.।؟]?$/u);
    return match ? { description: match[1].trim(), verse: match[2].trim() } : { description: translated, verse: "" };
  }
  const arabic = item.translations.ar ?? "";
  return {
    description: missingWaqfDescriptions[locale]?.[index] ?? item.translations.en ?? arabic,
    verse: arabic.match(/\{([\s\S]+)\}/u)?.[1]?.trim() ?? "",
  };
}

function waqfImagePath(item: WaqfItem) {
  return item.image.replace(/^assets\/svg\//, "/svg/");
}

export function WaqfGuideLink() {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<WaqfItem[]>([]);
  const [error, setError] = useState(false);
  const copy = waqfTranslations[locale];

  useEffect(() => {
    if (!open || items.length) return;
    const controller = new AbortController();
    fetch("/library/waqf_translated.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load waqf data: ${response.status}`);
        return response.json() as Promise<WaqfItem[]>;
      })
      .then(setItems)
      .catch((reason: unknown) => {
        if ((reason as { name?: string })?.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return <>
    <button className="waqf-guide-link" type="button" onClick={() => { setError(false); setOpen(true); }} aria-label={copy.navigation} title={copy.navigation}>
      <Image src="/svg/alwaqf.svg" width={58} height={58} alt="" aria-hidden="true" />
      <span>{copy.navigation}</span>
    </button>

    {open && <div className={styles.overlay} onClick={() => setOpen(false)}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="waqf-dialog-title" onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <Image src="/svg/alwaqf.svg" width={58} height={58} alt="" aria-hidden="true" />
            <div><small>{copy.eyebrow}</small><h2 id="waqf-dialog-title">{copy.title}</h2></div>
          </div>
          <button autoFocus type="button" onClick={() => setOpen(false)} aria-label={t("tafsir.close", "إغلاق")} title={t("tafsir.close", "إغلاق")}><X /></button>
        </header>

        <div className={styles.content}>
          <div className={styles.intro}>
            <div><h3>{copy.guideTitle}</h3><p>{copy.guideText}</p></div>
            <LottiePlayer className={styles.animation} src="/lottie/open_book.json" />
          </div>

          {!items.length && !error && <p className={styles.status}><LoaderCircle className="spin" />{t("common.loading", "جاري التحميل...")}</p>}
          {error && <p className={styles.error}>{t("common.error", "تعذر تحميل علامات الوقف.")}</p>}

          <div className={styles.grid}>
            {items.map((item, index) => {
              const explanation = explanationFor(item, locale, index);
              return <article className={styles.card} key={item.image}>
                <header>
                  <span className={styles.signImage}><Image src={waqfImagePath(item)} width={108} height={108} alt="" aria-hidden="true" /></span>
                  <div><small>{symbols[index]} · {String(index + 1).padStart(2, "0")}</small><h3>{copy.signs[index]}</h3></div>
                </header>
                <p>{explanation.description}</p>
                {explanation.verse && <blockquote lang="ar" dir="rtl" className="arabic-verse" data-no-translate><span>{copy.example}</span>{explanation.verse}</blockquote>}
              </article>;
            })}
          </div>
          <p className={styles.note}>{copy.sourceNote}</p>
        </div>
      </section>
    </div>}
  </>;
}
