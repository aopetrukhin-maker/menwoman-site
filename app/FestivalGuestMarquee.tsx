"use client";

import FestivalCarousel from "./FestivalCarousel";
import { festivalGuests } from "./festival-guests";
import styles from "./festival-guests.module.css";

export default function FestivalGuestMarquee() {
  return <div className={styles.gallery}>
    <div className={styles.heading}><p className="section-label">Люди прошлого фестиваля</p><h3>«Я иду на фестиваль…»</h3><p>Их слова перед прошлой встречей. Листайте истории без спешки.</p></div>
    <FestivalCarousel label="Гости прошлого фестиваля" className="guest-stories-carousel">
      {festivalGuests.filter((guest) => !guest.image.endsWith(".svg")).map((guest) => <article className={styles.card} key={guest.image}>
        <div className={styles.photo}><img src={guest.image} alt={guest.name} width="720" height="900" loading="lazy" /><span aria-hidden="true">МЖ</span></div>
        <div className={styles.copy}><small>Гость прошлого фестиваля</small><h4>{guest.name}, {guest.age}</h4><p>«{guest.reason}»</p></div>
      </article>)}
    </FestivalCarousel>
  </div>;
}
