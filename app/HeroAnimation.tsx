"use client";

import { useEffect, useRef, useState } from "react";
import "./hero-animation.css";

// Animation and image compositions from https://menwoman-b2b.tuqo.ru/.
export default function HeroAnimation() {
  const art = useRef<HTMLDivElement>(null);
  const [landing, setLanding] = useState("pending");
  const [paused, setPaused] = useState(false);
  const remaining = useRef(8400);

  useEffect(() => {
    let cancelled = false;
    let expired = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const complete = () => {
      if (!cancelled) setLanding("complete");
    };
    const onPreferenceChange = () => { if (reduced.matches) complete(); };
    reduced.addEventListener("change", onPreferenceChange);
    const images = [...(art.current?.querySelectorAll<HTMLImageElement>("img") ?? [])];
    // A failed or slow asset must never leave the intro permanently waiting.
    const fallbackTimer = setTimeout(() => { expired = true; complete(); }, 12000);
    Promise.allSettled(images.map((img) => img.decode())).then(() => {
      if (cancelled || expired) return;
      clearTimeout(fallbackTimer);
      if (reduced.matches) complete();
      else {
        setLanding("playing");
      }
    });
    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
      reduced.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  useEffect(() => {
    if (landing !== "playing" || paused) return;
    const started = performance.now();
    const timer = setTimeout(() => setLanding("complete"), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [landing, paused]);

  return (
    <div className="festival-intro">
      <div ref={art} className="eco-hero-art" data-landing={landing} data-paused={paused} role="img" aria-label="МЖ. Тайная комната: люстра падает, из дыма появляется надпись и по очереди загораются четыре зоны.">
        {["dark", "impact", "zone-1", "zone-2", "zone-3", "zone-4"].map((scene, index) => (
          <picture className={`eco-scene ${index === 0 ? "eco-scene-dark" : index === 1 ? "eco-scene-impact" : `eco-zone eco-${scene}`}`} key={scene}>
            <source media="(max-width: 760px)" srcSet={`/hero/secret-room-mobile-${index === 0 ? "dark" : "stage"}-room.webp`} />
            <img src={`/hero/secret-room-wide-${index === 0 ? "dark" : "stage"}-room.webp`} alt="" width="1672" height="941" fetchPriority={index === 0 ? "high" : "auto"} decoding="async" />
          </picture>
        ))}
        <img className="eco-chandelier" src="/hero/chandelier.webp" alt="" width="1312" height="1199" aria-hidden="true" />
        {["landing-flash", "light eco-light-left", "light eco-light-round", "light eco-light-middle", "light eco-light-front", "dust", "smoke"].map((effect) => <span className={`eco-${effect}`} key={effect} aria-hidden="true" />)}
      </div>
      {landing === "playing" && <button className="intro-control" type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>{paused ? "Продолжить анимацию" : "Остановить анимацию"}</button>}
      <a className="intro-skip" href="#festival-introduction" onClick={() => setLanding("complete")}>К фестивалю ↓</a>
    </div>
  );
}
