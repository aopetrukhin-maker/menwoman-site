"use client";

import { useState } from "react";
import { festivalGuests } from "./festival-guests";
import styles from "./festival-guests.module.css";

export default function FestivalGuestMarquee() {
  const [paused, setPaused] = useState(false);
  return <div className={styles.marquee}>
    <div className={styles.heading}><div><p className="section-label">Голоса гостей прошлой встречи</p><h3>«Я иду на фестиваль…»</h3><p>У каждого был свой повод. Вот что гости рассказывали перед прошлым фестивалем.</p></div><button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-controls="guest-marquee-track">{paused ? "Продолжить ленту" : "Остановить ленту"}<span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button></div>
    <div className={styles.viewport} tabIndex={0} role="region" aria-label="Истории гостей прошлого фестиваля. Ленту можно прокручивать." data-paused={paused} onPointerDown={() => setPaused(true)}>
      <div className={styles.track} id="guest-marquee-track">{[false, true].map((duplicate) => <div className={styles.group} key={String(duplicate)} aria-hidden={duplicate || undefined}>{festivalGuests.map((guest) => <article className={styles.card} key={guest.image}><img src={guest.image} alt="" width="88" height="110" loading="lazy" /><div><strong>{guest.name}, {guest.age}</strong><p>«{guest.reason}»</p></div></article>)}</div>)}</div>
    </div>
  </div>;
}
