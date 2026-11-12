"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HeroAnimation from "./HeroAnimation";
import { festivalEvent as event } from "./festival-event";
import { formatPrice, ticketPrices } from "./ticket-tariffs";
import styles from "./festival-hero.module.css";

type Phase = "pending" | "playing" | "hold" | "offer";

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
    if (phase !== "playing" && phase !== "hold") return;
    const timer = window.setTimeout(() => setPhase(phase === "playing" ? "hold" : "offer"), phase === "playing" ? 8400 : 800);
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
        <p className={styles.eyebrow}>Частный вечер в сердце Петербурга</p>
        <p className={styles.date}>3 декабря 2026 <span aria-hidden="true">/</span> {event.timeLabel}</p>
        <h1 id="festival-title" className={styles.title} ref={offerHeading} tabIndex={-1}>МЖ Сити.<br /><em>Тайная квартира</em></h1>
        <p className={styles.subtitle}>Фестиваль отношений с собой, с людьми и с жизнью</p>
        <p className={styles.lead}>Один вечер, чтобы выйти из привычного круга, услышать интересных людей, задать свой вопрос специалисту и познакомиться с теми, с кем хочется продолжить разговор.</p>
        <p className={styles.place}>«{event.venue}» · {event.city}<br />{event.address} · метро «{event.metro}»</p>
        <div className={styles.actions}>
          <a className={styles.primary} href="#application-form" data-cta-location="hero">Подать заявку</a>
          <a className={styles.secondary} href="#promo-code" data-cta-location="hero">У меня есть промокод</a>
        </div>
        <p className={styles.admission}>Билеты от {formatPrice(ticketPrices.start)} · Покупка после одобрения заявки</p>
      </div>
      {phase !== "offer" && (
        <div className={styles.controls} data-hero-controls>
          <span className={styles.openingLabel}>МЖ Сити <span aria-hidden="true">/</span> Двери открываются</span>
          <button type="button" className={styles.control} onClick={showOffer}>Смотреть фестиваль</button>
        </div>
      )}
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
