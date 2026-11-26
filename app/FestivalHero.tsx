"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HeroAnimation from "./HeroAnimation";
import { festivalEvent as event } from "./festival-event";
import { formatPrice, ticketPrices } from "./ticket-tariffs";
import styles from "./festival-hero.module.css";

type Phase = "pending" | "playing" | "offer";

export default function FestivalHero() {
  const [phase, setPhase] = useState<Phase>("pending");
  const offerHeading = useRef<HTMLHeadingElement>(null);
  const skipRequested = useRef(false);

  const onReady = useCallback((loaded: boolean) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A late image response must never restart an intro the visitor skipped.
    setPhase((current) => current === "pending" ? (loaded && !reduceMotion ? "playing" : "offer") : current);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => { if (preference.matches) setPhase("offer"); };
    applyPreference();
    preference.addEventListener("change", applyPreference);
    return () => preference.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setTimeout(() => setPhase("offer"), 9200);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "offer" && skipRequested.current) {
      // Preserve keyboard position when the skip control leaves the DOM.
      offerHeading.current?.focus({ preventScroll: true });
      skipRequested.current = false;
    }
  }, [phase]);

  const showOffer = () => {
    skipRequested.current = true;
    setPhase("offer");
  };

  return (
    <section className={`${styles.hero} primary-section`} id="festival-introduction" data-festival-hero data-phase={phase} style={{ padding: 0 }} aria-labelledby="festival-title">
      <div className={styles.scene} data-hero-scene aria-hidden="true">
        <HeroAnimation landing={phase === "pending" ? "pending" : phase === "playing" ? "playing" : "complete"} onReady={onReady} />
      </div>
      <div className={styles.shade} data-hero-shade aria-hidden="true" />
      <div className={styles.copy} data-hero-offer>
        <p className={styles.eyebrow}>Фестиваль об отношениях в Петербурге</p>
        <h1 id="festival-title" className={styles.title} ref={offerHeading} tabIndex={-1}>МЖ Сити.<br /><em>Тайная резиденция</em></h1>
        <ul className={styles.benefits} aria-label="Что вас ждёт на фестивале">
          <li><strong>Бесплатная консультация с психологом</strong> прямо на фестивале. Выберите специалиста и оставьте запрос. Количество мест ограничено.</li>
          <li><strong>Выступления об отношениях:</strong> близость, ссоры в паре, знакомство и выбор партнёра.</li>
          <li><strong>Живые знакомства по желанию.</strong> Можно прийти одному или вдвоём.</li>
        </ul>
        <p className={styles.place}>{event.dateLabel} · «{event.venue}» · от {formatPrice(ticketPrices.start)}</p>
        <div className={styles.actions}>
          <a className={styles.primary} href="#pricing">Выбрать билет</a>
          <a className={styles.secondary} href="#choose-psychologist">Выбрать психолога</a>
        </div>
        {phase === "playing" && <button type="button" className={styles.skip} onClick={showOffer}>Пропустить анимацию</button>}
      </div>
      <noscript><style>{`
        [data-festival-hero] [data-hero-offer] { opacity: 1 !important; visibility: visible !important; transform: none !important; }
        [data-festival-hero] [data-hero-shade] { opacity: 1 !important; }
        [data-festival-hero] [data-hero-scene] { filter: blur(7px); transform: scale(1.035); }
        [data-festival-hero] .eco-zone { opacity: 1; }
        [data-festival-hero] .eco-chandelier, [data-festival-hero] [data-hero-controls] { display: none !important; }
      `}</style></noscript>
    </section>
  );
}
