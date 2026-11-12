"use client";

import { useEffect, useRef } from "react";
import "./hero-animation.css";

type HeroAnimationProps = {
  landing?: "pending" | "playing" | "complete";
  paused?: boolean;
  onReady?: (loaded: boolean) => void;
};

// Animation and image compositions from https://menwoman-b2b.tuqo.ru/.
export default function HeroAnimation({ landing = "complete", paused = false, onReady }: HeroAnimationProps) {
  const art = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onReady) return;
    let cancelled = false;
    let settled = false;
    const finish = (loaded: boolean) => {
      if (cancelled || settled) return;
      settled = true;
      onReady(loaded);
    };
    const images = [...(art.current?.querySelectorAll<HTMLImageElement>("img") ?? [])];
    // Do not make a slow connection or a missing image a barrier to the offer.
    const fallbackTimer = window.setTimeout(() => finish(false), 5000);
    Promise.allSettled(images.map((img) => img.decode())).then((results) => {
      clearTimeout(fallbackTimer);
      finish(results.every((result) => result.status === "fulfilled") && images.every((img) => img.naturalWidth > 0));
    });
    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, [onReady]);

  return (
    <div className="festival-intro">
      <div ref={art} className="eco-hero-art" data-landing={landing} data-paused={paused} role="img" aria-label="Тайная квартира МЖ: хрустальная люстра, золотая надпись и тёплый свет вечерних залов.">
        {["dark", "impact", "zone-1", "zone-2", "zone-3", "zone-4"].map((scene, index) => (
          <picture className={`eco-scene ${index === 0 ? "eco-scene-dark" : index === 1 ? "eco-scene-impact" : `eco-zone eco-${scene}`}`} key={scene}>
            <source media="(max-width: 760px)" srcSet={`/hero/secret-room-mobile-${index === 0 ? "dark" : "stage"}-room.webp`} />
            <img src={`/hero/secret-room-wide-${index === 0 ? "dark" : "stage"}-room.webp`} alt="" width="1672" height="941" fetchPriority={index === 0 ? "high" : "auto"} decoding="async" />
          </picture>
        ))}
        <img className="eco-chandelier" src="/hero/chandelier.webp" alt="" width="1312" height="1199" aria-hidden="true" />
        {["landing-flash", "light eco-light-left", "light eco-light-round", "light eco-light-middle", "light eco-light-front", "dust", "smoke"].map((effect) => <span className={`eco-${effect}`} key={effect} aria-hidden="true" />)}
      </div>
    </div>
  );
}
