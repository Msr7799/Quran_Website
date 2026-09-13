// المسار: src/components/YouTubeShowcase.tsx — يعرض محتوى قناة يوتيوب وإحصاءاتها ومقاطعها.
"use client";

import Image from "next/image";
import { ExternalLink, ListVideo, Play, Plus, Video } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import type { YouTubeHomeContent } from "@/lib/youtube-types";

// ينسق أعداد يوتيوب وفق لغة الواجهة.
function formatCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

// يعرض بيانات القناة وقوائم الفيديو المتاحة.
export function YouTubeShowcase({ content, compact = false }: { content: YouTubeHomeContent | null; compact?: boolean }) {
  const { locale, t } = useLocale();
  const [playingId, setPlayingId] = useState<string | null>(null);
  if (!content) return <section className="section youtube-page-message"><h1>{t("youtube.pageTitle")}</h1><p>{t("youtube.unavailable")}</p></section>;
  const channelUrl = `https://www.youtube.com/channel/${content.channelId}`;

  return <section className={`section youtube-home-section${compact ? " youtube-home-section--compact" : ""}`} aria-labelledby="youtube-home-title">
    <div className="youtube-channel-bar">
      <div className="youtube-channel-identity">
        {content.channelThumbnailUrl && <Image src={content.channelThumbnailUrl} width={64} height={64} alt="" unoptimized />}
        <div>
          <span className="eyebrow">{t("youtube.officialChannel", "القناة الرسمية على يوتيوب")}</span>
          {compact
            ? <h2 id="youtube-home-title">{content.channelTitle}</h2>
            : <h1 id="youtube-home-title">{content.channelTitle}</h1>}
          {content.subscriberCount !== null && <p><span className="number-font">{formatCount(content.subscriberCount, locale)}</span> {t("youtube.subscribers", "مشترك")}</p>}
        </div>
      </div>
      <a className="youtube-subscribe-button" href={channelUrl} target="_blank" rel="noreferrer">
        <Video aria-hidden="true" /> {t("youtube.subscribe", "اشترك في القناة")}
      </a>
    </div>

    {content.shorts.length > 0 && <div className="youtube-content-block">
      <div className="youtube-block-heading">
        <div><span className="eyebrow">{t("youtube.shortsLabel")}</span><h3>{t("youtube.latestShorts", "أحدث المقاطع القصيرة")}</h3></div>
        <a href={`${channelUrl}/shorts`} target="_blank" rel="noreferrer">{t("youtube.viewAll", "عرض الكل")} <ExternalLink /></a>
      </div>
      <div className="youtube-shorts-grid">
        {content.shorts.map((video) => <article className="youtube-short-card" key={video.id}>
          <div className="youtube-short-media">
            {playingId === video.id ? <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            /> : <button type="button" onClick={() => setPlayingId(video.id)} aria-label={`${t("youtube.play", "تشغيل")} ${video.title}`}>
              <Image src={video.thumbnailUrl} alt="" fill sizes="(max-width: 620px) 72vw, (max-width: 1100px) 34vw, 230px" unoptimized />
              <span><Play fill="currentColor" /></span>
            </button>}
          </div>
          <a href={`https://www.youtube.com/shorts/${video.id}`} target="_blank" rel="noreferrer">{video.title}</a>
        </article>)}
        <a className="youtube-more-card youtube-more-card--shorts" href={`${channelUrl}/shorts`} target="_blank" rel="noreferrer" aria-label={t("youtube.viewAll")}>
          <Plus aria-hidden="true" />
          <span>{t("youtube.viewAll")}</span>
        </a>
      </div>
    </div>}

    {content.featuredVideos.length > 0 && <div className="youtube-content-block">
      <div className="youtube-block-heading">
        <div><span className="eyebrow">{t("youtube.featuredLabel")}</span><h3>{t("youtube.featuredVideos")}</h3></div>
        <a href={`${channelUrl}/videos`} target="_blank" rel="noreferrer">{t("youtube.viewAll")} <ExternalLink /></a>
      </div>
      <div className="youtube-featured-grid">
        {content.featuredVideos.map((video) => <article className="youtube-featured-card" key={video.id}>
          <div className="youtube-featured-media">
            {playingId === video.id ? <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            /> : <button type="button" onClick={() => setPlayingId(video.id)} aria-label={`${t("youtube.play")} ${video.title}`}>
              <Image src={video.thumbnailUrl} alt="" fill sizes="(max-width: 700px) 92vw, (max-width: 1100px) 42vw, 300px" unoptimized />
              <span><Play fill="currentColor" /></span>
            </button>}
          </div>
          <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">{video.title}</a>
        </article>)}
        <a className="youtube-more-card youtube-more-card--videos" href={`${channelUrl}/videos`} target="_blank" rel="noreferrer" aria-label={t("youtube.viewAll")}>
          <Plus aria-hidden="true" />
          <span>{t("youtube.viewAll")}</span>
        </a>
      </div>
    </div>}

    {content.playlists.length > 0 && <div className="youtube-content-block">
      <div className="youtube-block-heading">
        <div><span className="eyebrow">{t("youtube.playlistsLabel")}</span><h3>{t("youtube.playlists", "قوائم التشغيل")}</h3></div>
        <a href={`${channelUrl}/playlists`} target="_blank" rel="noreferrer">{t("youtube.viewAll", "عرض الكل")} <ExternalLink /></a>
      </div>
      <div className="youtube-playlists-grid">
        {content.playlists.map((playlist) => <a className="youtube-playlist-card" href={`https://www.youtube.com/playlist?list=${playlist.id}`} target="_blank" rel="noreferrer" key={playlist.id}>
          <div className="youtube-playlist-image">
            <Image src={playlist.thumbnailUrl} alt="" fill sizes="(max-width: 700px) 92vw, 430px" unoptimized />
            <span><ListVideo /> <b className="number-font">{playlist.itemCount}</b> {t("youtube.videos", "فيديو")}</span>
          </div>
          <h4>{playlist.title}</h4>
        </a>)}
      </div>
    </div>}
  </section>;
}
