"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FestivalHero from "./FestivalHero";
import FestivalApartment from "./FestivalApartment";
import FestivalGuestMarquee from "./FestivalGuestMarquee";
import FestivalVenue from "./FestivalVenue";
import FestivalProgramme from "./FestivalProgramme";
import SpeakerConsultationForm from "./SpeakerConsultationForm";
import FestivalExhibition, { FestivalConsultations } from "./FestivalSections";
import { FestivalDating, FestivalPartners } from "./FestivalAtmosphere";
import { type FestivalParticipant } from "./festival-participants";
import "./festival-conversion.css";
import "./festival-structure.css";
import "./festival-city.css";
import "./festival-luxury.css";
import "./festival-upgrades.css";
import "./festival-gifts.css";
import "./festival-recruitment.css";
import "./review.css";
import FestivalPricing from "./FestivalPricing";
import FestivalGifts from "./FestivalGifts";
import { formatPrice, giftNominals } from "./ticket-tariffs";
import { festivalEvent as event } from "./festival-event";

const telegramUrl = "https://t.me/redheadlitle";

const partners = [
  { name: "ADORO", image: "/partners/adoro.jpg" },
  { name: "Бизнес Дельники", image: "/partners/bizdelniki.jpg" },
  { name: "Бизнес События СПБ", image: "/partners/busines.jpg" },
  { name: "Дедушка русского пара", image: "/partners/dedushka.png" },
  { name: "Фонд ЭНБИ", image: "/partners/enbi.png" },
  { name: "Грелка", image: "/partners/grelka.webp" },
  { name: "Кипенский гриб", image: "/partners/kipensky-grib.webp" },
  { name: "Secret", image: "/partners/secret.webp" },
  { name: "Montana", image: "/partners/montana.webp" },
  { name: "Нуждички", image: "/partners/nuzhdichki.webp" },
  { name: "RR Corporation", image: "/partners/rr-corporation.webp" },
  { name: "SMOOTH Lifestyle Radio", image: "/partners/smooth-radio.webp" },
  { name: "Взлёт", image: "/partners/vzlet.webp" },
  { name: "Линчевская Юлиана", image: "/partners/linchevskaya.webp" },
  { name: "Только по делу", image: "/partners/tolko.jpg" },
  { name: "Body Impulse", image: "/partners/bi.png" },
  { name: "Хвойный квас", image: "/partners/hvoyny-kvas.webp" },
  { name: "Кузнецова", image: "/partners/kuznezova.jpg" },
  { name: "Паунти", image: "/partners/paunty.jpg" },
  { name: "ЯПокупаю", image: "/partners/pokupau.jpg" },
  { name: "ПРОЯВИСЬ", image: "/partners/proyavis.jpg" },
  { name: "Кваренги", image: "/partners/quarenghi.jpg" },
  { name: "Женский клуб", image: "/partners/women-club.png" },
  { name: "Журнал SOK - Стиль. Образ. Качество жизни", image: "/partners/sok-magazine.webp" },
  { name: "Центр просвещения и досуга «СюрПриз»", image: "/partners/surpriz.webp" },
  { name: "Философия Здоровья доктора К. С. Суханова", image: "/partners/philosophy-health-sukhanov.jpg" },
  { name: "LEVEL UP - Свидание в Темноте", image: "/partners/level-up-date-in-dark.svg" },
];


export default function Home() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<FestivalParticipant | null>(null);
  const profileTrigger = useRef<HTMLElement>(null);
  const [consultation, setConsultation] = useState<{ speaker: string; trigger: HTMLElement } | null>(null);
  const openProfile = (participant: FestivalParticipant, trigger: HTMLElement) => {
    profileTrigger.current = trigger;
    setSelectedSpeaker(participant);
  };
  const openConsultation = (speaker: string, trigger: HTMLElement) => setConsultation({ speaker, trigger });
  const closeConsultation = useCallback(() => setConsultation(null), []);
  const [cookieVisible, setCookieVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCookieVisible(window.localStorage.getItem("mj-cookie-ok") !== "1");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!selectedSpeaker) return;
    const previousFocus = profileTrigger.current;
    const dialog = document.querySelector<HTMLElement>(".speaker-modal");
    const controls = () => [...(dialog?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]') ?? [])];
    controls()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (document.querySelector(".review-dialog[open]")) return;
      if (event.key === "Escape") setSelectedSpeaker(null);
      if (event.key !== "Tab") return;
      const focusable = controls();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.body.style.overflow = selectedSpeaker ? "hidden" : "";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [selectedSpeaker]);

  const acceptCookies = () => {
    window.localStorage.setItem("mj-cookie-ok", "1");
    setCookieVisible(false);
  };

  return (
    <main className="page-restructured city-edition luxury-edition">
      <nav className="floating-nav" aria-label="Навигация по странице">
        <a className="nav-brand" href="#">
          <strong>МЖ</strong>
          <span>{event.dateLabel}</span>
        </a>
        <div className="nav-links"><a href="#program">Программа</a><a href="#consultations">Консультации</a><a href="#logistics">Площадка</a></div>
        <a className="nav-gift-cta" href="#bonuses"><span>Подарки</span><strong>до {formatPrice(giftNominals.vip)}</strong></a>
        <a className="nav-bonus-cta" href="#pricing">Билеты</a>
        <details className="mobile-nav"><summary>Меню</summary><div>{[["program","Программа"],["dating","Браслеты и знакомства"],["consultations","Консультации"],["expo","Выставка"],["logistics","Площадка"],["pricing","Билеты"],["bonuses","Подарки от партнёров"]].map(([id,label]) => <a key={id} href={`#${id}`} onClick={e => e.currentTarget.closest("details")?.removeAttribute("open")}>{label}</a>)}</div></details>
      </nav>
      <FestivalHero />
      <p className="container review-pair-invite">Приходите вдвоём ради вашего совместного вечера: выступлений о близости, отношениях и семье. Можно слушать, обсуждать важное для вашей пары и проводить время вместе. Новые знакомства необязательны.</p>
      <FestivalProgramme onSelect={openProfile} onConsultation={openConsultation} />
      <FestivalDating />
      <FestivalConsultations onSelect={openProfile} onConsultation={openConsultation} />
      <FestivalExhibition onSelect={openProfile} />
      <FestivalVenue />
      <p className="container review-note" id="afterparty">После программы можно остаться на музыку и пообщаться у бара.</p>
      <FestivalPricing />
      <FestivalGifts />
      <section className="container review-block" id="questions"><h2>Частые вопросы</h2>
        <details><summary>Обязательно знакомиться?</summary><p>Нет. Вы можете прийти ради программы и провести вечер в своём кругу.</p></details>
        <details><summary>Что даёт парный билет?</summary><p>Два места по выбранному тарифу. На странице Qtickets повторите выбор тарифа и формата.</p></details>
        <details><summary>Запрос на консультацию подтверждает запись?</summary><p>Нет. Запись требует отдельного подтверждения команды фестиваля. Команда свяжется с вами по указанному контакту.</p></details>
        <p><a className="primary-button" href="#pricing">Выбрать билет</a></p>
      </section>
      <FestivalPartners partners={partners} />
      <section className="container review-block" id="guest-stories" aria-labelledby="guest-stories-title">
        <FestivalGuestMarquee />
      </section>
      <details className="review-doors">
        <summary className="container">Открыть двери Тайной резиденции</summary>
        <FestivalApartment />
      </details>

      <footer>
        <div className="container footer-grid">
          <div><strong>МЖ</strong><p>МЖ Сити. Тайная резиденция.<br />Фестиваль 3 декабря</p></div>
          <div><span>Задать вопрос</span><a href="tel:+79625759813">8 962 575-98-13</a><a href={telegramUrl} target="_blank" rel="noreferrer">Telegram: @redheadlitle</a><a href="mailto:noname.eventspb@gmail.com">noname.eventspb@gmail.com</a></div>
          <div><span>Адрес фестиваля МЖ</span><p>«{event.venue}»<br />{event.city}, {event.address}<br />Метро «{event.metro}»<br />{event.dateLabel} · {event.timeLabel}</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Фестиваль «Мужчина и Женщина»</span><a href={telegramUrl} target="_blank" rel="noreferrer">Партнёрам и медиа</a><a href="#bonuses">Подарки</a><a href="#">Вернуться к началу</a></div>
      </footer>

      {selectedSpeaker && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedSpeaker(null)}>
          <article className="speaker-modal" role="dialog" aria-modal="true" aria-labelledby="speaker-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSpeaker(null)} aria-label="Закрыть">×</button>
            <div className={`modal-visual ${selectedSpeaker.tone}${selectedSpeaker.image ? " has-photo" : ""}`}>
              {selectedSpeaker.image ? (
                selectedSpeaker.imageSecondary ? <div className="participant-duo"><img src={selectedSpeaker.image} alt="Саша Бочар" /><img src={selectedSpeaker.imageSecondary} alt="Олег Гром" /></div> : <img src={selectedSpeaker.image} alt={selectedSpeaker.name} style={{ objectPosition: selectedSpeaker.imagePosition }} />
              ) : (
                <span>{selectedSpeaker.initials}</span>
              )}
            </div>
            <div className="modal-copy">
              <p className="section-label">Участник фестиваля</p>
              <h2 id="speaker-modal-title">{selectedSpeaker.name}</h2>
              <p className="modal-role">{selectedSpeaker.role}</p>
              {selectedSpeaker.stage && <div className="modal-topic"><span>Тема выступления</span><strong>{selectedSpeaker.topic ?? "Тему объявим после согласования"}</strong></div>}
              {selectedSpeaker.note && <p className="festival-pending">{selectedSpeaker.note}</p>}
              {selectedSpeaker.description && <p className="modal-description">{selectedSpeaker.description}</p>}
              {selectedSpeaker.facts.length > 0 && <div className="participant-session"><h3>Опыт и проекты</h3><ul>{selectedSpeaker.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div>}
              {selectedSpeaker.sessionHighlights && <div className="participant-session"><h3>Что будет внутри</h3><ol>{selectedSpeaker.sessionHighlights.map((item) => <li key={item}>{item}</li>)}</ol></div>}
              {selectedSpeaker.sessionOutcome && <div className="participant-session"><h3>С чем уйдёте</h3><p>{selectedSpeaker.sessionOutcome}</p></div>}
              {selectedSpeaker.sessionFormat && <div className="participant-session"><h3>Формат</h3><p>{selectedSpeaker.sessionFormat}</p></div>}
              <div className="participant-formats">{selectedSpeaker.appearances.map((appearance) => <article key={appearance.label}><h4>{appearance.label}</h4><p>{appearance.text}</p>{appearance.note && <p className="festival-pending">{appearance.note}</p>}</article>)}</div>
              <p className="consultation-field-note" id="profile-consultation-note">Запрос не подтверждает запись. Команда отвечает по телефону или в Telegram.</p>
              <button className="consultation-request-button" type="button" aria-describedby="profile-consultation-note" onClick={event => openConsultation(selectedSpeaker.name, event.currentTarget)}>Оставить запрос на консультацию</button>
              <div className="speaker-project-links">{selectedSpeaker.links?.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}</div>
            </div>
          </article>
        </div>
      )}

      {consultation && <SpeakerConsultationForm key={consultation.speaker} {...consultation} onClose={closeConsultation} />}

      {cookieVisible && (
        <div className="cookie-banner">
          <p>Мы используем только необходимые cookie для корректной работы сайта.</p>
          <button onClick={acceptCookies}>Понятно</button>
        </div>
      )}
    </main>
  );
}
