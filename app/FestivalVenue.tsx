import { festivalEvent as event } from "./festival-event";
import "./festival-venue.css";

const photos = [
  { src: "/venue/venue-main.jpeg", caption: "Интерьер ресторана «Антресоль и Перец»", width: 1280, height: 853 },
  { src: "/venue/venue-tea.jpeg", caption: "Чайная гостиная", width: 585, height: 371 },
  { src: "/venue/venue-cabinet.jpeg", caption: "Камерный кабинет", width: 640, height: 480 },
  { src: "/venue/venue-stage.jpeg", caption: "Сцена площадки", width: 1280, height: 853 },
];

export default function FestivalVenue() {
  return (
    <section className="section logistics-section" id="logistics">
      <div className="container logistics-card">
        <div className="logistics-main">
          <p className="section-label">Адрес фестиваля МЖ</p>
          <span className="logistics-date">{event.dateShort}</span>
          <h2>Антресоль <span>и Перец</span></h2>
          <p className="logistics-address">{event.city}<br />{event.address}<br />Метро «{event.metro}»</p>
          <a className="primary-button" href={event.mapUrl} target="_blank" rel="noreferrer"><span>Открыть маршрут</span><i className="button-icon" aria-hidden="true">↗</i></a>
        </div>
        <div className="logistics-facts">
          <article><span>16:00</span><p>Начало фестиваля<br />3 декабря 2026 года</p></article>
          <article><span>00:00</span><p>Завершение фестиваля<br />В ночь на 4 декабря</p></article>
          <div className="logistics-note"><strong>Всё в одном месте</strong><p>Выступления, экспозона, консультации и практики — в ресторане «{event.venue}». Время отдельных активностей и условия участия уточняются.</p></div>
        </div>
      </div>
      <div className="container venue-photos">
        <h3>Место нашей встречи</h3>
        <p>«{event.venue}», {event.city}, {event.address}.</p>
        <div className="venue-photo-grid">
          {photos.map((photo) => <figure key={photo.src}>
            <img src={photo.src} alt={photo.caption} width={photo.width} height={photo.height} loading="lazy" />
            <figcaption>{photo.caption}</figcaption>
          </figure>)}
        </div>
      </div>
    </section>
  );
}
