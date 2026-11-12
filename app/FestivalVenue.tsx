import { festivalEvent as event } from "./festival-event";
import "./festival-venue.css";
const photos = [
  { src: "/venue/venue-tea.jpeg", caption: "Чайная гостиная", width: 585, height: 371 },
  { src: "/venue/venue-cabinet.jpeg", caption: "Камерный кабинет", width: 640, height: 480 },
  { src: "/venue/venue-stage.jpeg", caption: "Сцена площадки", width: 1280, height: 853 },
];
export default function FestivalVenue() {
  return <section className="section venue-section primary-section" id="logistics"><div className="container">
    <div className="section-heading split-heading"><div><p className="section-label">05 / Место встречи</p><h2>«Антресоль <span>и Перец»</span></h2></div><p>Фестиваль МЖ проходит в одном пространстве в центре Петербурга.</p></div>
    <div className="venue-overview"><figure><img src="/venue/venue-main.jpeg" alt="Интерьер ресторана «Антресоль и Перец»" width="1280" height="853" loading="lazy" /><figcaption>Интерьер ресторана «Антресоль и Перец»</figcaption></figure><div className="venue-information"><p className="venue-event-date">{event.dateLabel}</p><h3>{event.timeLabel}</h3><p>Начало — 16:00.<br />В ночь на 4 декабря, в 00:00, завершаем встречу.</p><address>{event.city}<br />{event.address}<br />Метро «{event.metro}»</address><a className="secondary-button" href={event.mapUrl} target="_blank" rel="noreferrer">Открыть маршрут ↗</a></div></div>
    <details className="venue-more"><summary>Ещё фотографии площадки <span aria-hidden="true">+</span></summary><div className="venue-photo-grid">{photos.map((photo) => <figure key={photo.src}><img src={photo.src} alt={photo.caption} width={photo.width} height={photo.height} loading="lazy" /><figcaption>{photo.caption}</figcaption></figure>)}</div></details>
    <div className="venue-practical"><details><summary>Можно ли приехать после работы?</summary><p>Фестиваль проходит с 16:00 до 00:00. Возможность позднего входа и программу на интересующее время уточните у модератора до покупки.</p></details><details><summary>Входят ли еда и напитки в билет?</summary><p>Условия питания и напитков пока не опубликованы. Их нужно уточнить у организатора до покупки. Состав каждого тарифа указан в карточке билета.</p></details></div>
  </div></section>;
}
