"use client";

import { useState } from "react";
import { festivalGuests } from "./festival-guests";
import styles from "./festival-guests.module.css";

export default function FestivalGuestMarquee() {
  const [paused, setPaused] = useState(false);
  return <div className={styles.marquee}>
    <div className={styles.heading}><div><h2 id="guest-stories-title">«Я иду на фестиваль…»</h2><p>Перед прошлым фестивалем гости рассказали, зачем собираются прийти.</p></div><button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-controls="guest-marquee-track">{paused ? "Продолжить ленту" : "Остановить ленту"}<span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button></div>
    <div className={styles.viewport} tabIndex={0} role="region" aria-label="Причины прийти на прошлый фестиваль. Ленту можно прокручивать." data-paused={paused} onPointerDown={() => setPaused(true)}>
      <div className={styles.track} id="guest-marquee-track">{[false, true].map((duplicate) => <div className={styles.group} key={String(duplicate)} aria-hidden={duplicate || undefined}>{festivalGuests.map((guest) => <article className={styles.card} key={guest.image}><img src={guest.image} alt="" width="720" height="900" loading="lazy" /><div><strong>{guest.name}, {guest.age}</strong><p>«{guest.reason}»</p></div></article>)}</div>)}</div>
    </div>
  </div>;
}
