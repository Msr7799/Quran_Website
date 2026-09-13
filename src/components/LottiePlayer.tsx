"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export function LottiePlayer({ src, className, label }: { src: string; className?: string; label?: string }) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);

    const controller = new AbortController();
    // Lottie JSON ships with the app and is faster from the same-origin Vercel CDN.
    fetch(src, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load animation: ${response.status}`);
        return response.json() as Promise<object>;
      })
      .then(setAnimationData)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setAnimationData(null);
      });

    return () => {
      controller.abort();
      media.removeEventListener("change", updatePreference);
    };
  }, [src]);

  if (!animationData) return null;
  return <Lottie className={className} animationData={animationData} autoplay={!reduceMotion} loop={!reduceMotion} aria-label={label} aria-hidden={label ? undefined : true} />;
}
