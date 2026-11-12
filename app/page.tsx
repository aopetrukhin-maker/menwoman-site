"use client";

import { useEffect, useState } from "react";
import FestivalHero from "./FestivalHero";
import FestivalGuestMarquee from "./FestivalGuestMarquee";
import FestivalVenue from "./FestivalVenue";
import FestivalAdmission from "./FestivalAdmission";
import FestivalParticipation from "./FestivalExperience";
import FestivalProgramme from "./FestivalProgramme";
import FestivalExhibition, { FestivalConsultations } from "./FestivalSections";
import FestivalConcept, { FestivalReflection } from "./FestivalConcept";
import { FestivalDating, FestivalBar, FestivalAfterparty, FestivalPartners } from "./FestivalAtmosphere";
import { type FestivalParticipant } from "./festival-participants";
import { startFunnelTracking } from "./funnel-tracking";
import "./festival-conversion.css";
import "./festival-structure.css";
import "./festival-city.css";
import "./festival-luxury.css";
import { startAdmissionNavigation } from "./admission-context";
import { tickets, ticketPrices, pairPrices, formatPrice } from "./ticket-tariffs";
import { festivalEvent as event } from "./festival-event";

const telegramUrl = "https://t.me/redheadlitle";

const partners = [
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
  { name: "Журнал SOK - Стиль. Образ. Качество жизни", image: "/partners/sok-magazine.webp" },
  { name: "Центр просвещения и досуга «СюрПриз»", image: "/partners/surpriz.webp" },
  { name: "Философия Здоровья доктора К. С. Суханова", image: "/partners/philosophy-health-sukhanov.jpg" },
  { name: "LEVEL UP - Свидание в Темноте", image: "/partners/level-up-date-in-dark.svg" },
];


function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function BonusSection() {
  return <section className="section city-gifts primary-section" id="bonuses"><div className="container">
    <div className="section-heading split-heading"><div><p className="section-label">08 / Подарки партнёров</p><h2>Подарки, которыми<br /><span>вечер не заканчивается</span></h2></div><p>Знакомство с проектами партнёров можно продолжить и после фестиваля: через услуги, впечатления и предложения из подарочного каталога. Выбирайте то, что интересно именно вам.</p></div>
    <div className="city-gift-tiers"><article><span>Перезагрузка</span><p>Выбор подарков и сертификатов</p><strong><small>до</small> 50 000 <small>₽</small></strong><span>по номинальной стоимости предложений</span></article><article><span>VIP</span><p>Расширенный выбор подарков и сертификатов</p><strong><small>до</small> 100 000 <small>₽</small></strong><span>по номинальной стоимости предложений</span></article></div>
    <p className="city-fine-print">Это лимит номинальной стоимости выбранных предложений, а не денежная выплата. Состав каталога на 3 декабря, сроки использования, ограничения и возможные дополнительные расходы уточняются.</p>
    <a className="gift-archive-link" href="/gifts/">Открыть подарки для купивших билеты ↗</a>
  </div></section>;
}

function AttendeeSection() {
  return <section className="section festival-history primary-section" id="community"><div className="container">
    <div className="history-layout"><figure><img src="/history/festival-guests.jpg" alt="Гости и команда предыдущего фестиваля МЖ" width="2048" height="1365" loading="lazy" /><figcaption>Предыдущая встреча сообщества МЖ</figcaption></figure><div><p className="section-label">11 / Предыдущий фестиваль</p><h2>До этой встречи у МЖ<br /><span>уже была история</span></h2><p>Люди, разговоры, выступления и знакомства, из которых складывается атмосфера фестиваля. Посмотрите, как проходила предыдущая встреча.</p><a className="text-link" href="#application-form">Присоединиться к новой встрече ↗</a></div></div>
    <FestivalGuestMarquee />
  </div></section>;
}

function PricingSection() {
  const [purchaseFormat, setPurchaseFormat] = useState<"single" | "pair">("single");
  return (
    <section className="section pricing-section primary-section" id="pricing">
      <div className="container">
        <div className="section-heading center-heading">
          <p className="section-label">14 / Билеты и состав тарифов</p>
          <h2>Как вы хотите<br /><span>провести этот вечер?</span></h2>
          <p>Участие по заявке. После одобрения модератором вы получите персональный промокод для покупки билета.</p>
        </div>
        <div className="admission-actions">
          <a className="primary-button" href="#application-form">Подать заявку</a>
          <a className="secondary-button" href="#promo-code">У меня есть промокод</a>
        </div>
        <div className="ticket-format-choice" role="group" aria-label="Количество участников в билете"><button type="button" aria-pressed={purchaseFormat === "single"} onClick={() => setPurchaseFormat("single")}>Один</button><button type="button" aria-pressed={purchaseFormat === "pair"} onClick={() => setPurchaseFormat("pair")}>Вдвоём</button></div>
        <div className="pricing-grid">
          {tickets.map((ticket) => (
            <article className={`price-card price-card-${ticket.tier} ${ticket.featured ? "featured" : ""}`} key={ticket.name}>
              {ticket.featured && <div className="popular">Больше возможностей</div>}
              <div className="price-head"><h3>{ticket.name}</h3><strong>{formatPrice((purchaseFormat === "pair" ? pairPrices : ticketPrices)[ticket.tier])}</strong><span>{purchaseFormat === "pair" ? "Цена за двоих" : "Цена за 1 билет"}</span></div>
              <div className="ticket-highlight-list">{ticket.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}</div>
              <p>{ticket.description}</p>
              <details className="ticket-details"><summary>Полный состав тарифа <b>+</b></summary><ul>{ticket.items.map((item) => <li key={item}><b>✓</b>{item}</li>)}</ul></details>
              <a href="#application-form" data-tier={ticket.tier} data-format={purchaseFormat} data-cta-location={`tariff-${ticket.tier}`}>Подать заявку <i className="button-icon"><ArrowIcon /></i></a>
              <a className="admission-promo-link" href="#promo-code" data-cta-location={`tariff-${ticket.tier}`}>У меня есть промокод</a>
            </article>
          ))}
        </div>
        <FestivalParticipation />
      </div>
    </section>
  );
}

export default function Home() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<FestivalParticipant | null>(null);
  const [cookieVisible, setCookieVisible] = useState(false);
  useEffect(() => startFunnelTracking(), []);
  useEffect(() => startAdmissionNavigation(), []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCookieVisible(window.localStorage.getItem("mj-cookie-ok") !== "1");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!selectedSpeaker) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.querySelector<HTMLElement>(".speaker-modal");
    const controls = () => [...(dialog?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]') ?? [])];
    controls()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
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
      previousFocus?.focus();
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
          <strong>МЖ Сити</strong>
          <span>{event.dateLabel}</span>
        </a>
        <div className="nav-links"><a href="#balance">Концепция</a><a href="#program">Спикеры</a><a href="#consultations">Консультации</a><a href="#dating">Знакомства</a><a href="#pricing">Билеты</a></div>
        <a className="nav-bonus-cta" href="#application-form" data-cta-location="header"><span className="nav-bonus-full">Подать заявку</span><span className="nav-bonus-short">Заявка</span></a>
        <details className="mobile-nav">
          <summary aria-label="Открыть меню">Меню</summary>
          <div><a href="#balance">Свой маршрут по фестивалю</a><a href="#program">Программа и спикеры</a><a href="#consultations">Консультации</a><a href="#dating">Знакомства</a><a href="#expo">Экспозона и практики</a><a href="#logistics">Площадка</a><a href="#pricing">Билеты</a><a href="#participation">Как попасть</a><a href="#application-form" data-cta-location="mobile-menu">Подать заявку</a><a href="#promo-code" data-cta-location="mobile-menu">У меня есть промокод</a><a href="/gifts/">Подарки для купивших</a></div>
        </details>
      </nav>

      <FestivalHero />

      <FestivalReflection />
      <FestivalConcept />
      <FestivalProgramme onSelect={setSelectedSpeaker} />
      <FestivalConsultations onSelect={setSelectedSpeaker} />
      <FestivalExhibition onSelect={setSelectedSpeaker} />
      <FestivalDating />
      <BonusSection />
      <FestivalBar />
      <FestivalAfterparty />
      <AttendeeSection />
      <FestivalPartners archive={partners} />
      <FestivalVenue />
      <PricingSection />
      <FestivalAdmission />

      <footer>
        <div className="container footer-grid">
          <div><strong>МЖ</strong><p>МЖ Сити. Тайная квартира.<br />Фестиваль 3 декабря</p></div>
          <div><span>Задать вопрос</span><a href="tel:+79625759813">8 962 575-98-13</a><a href={telegramUrl} target="_blank" rel="noreferrer">Telegram: @redheadlitle</a><a href="mailto:noname.eventspb@gmail.com">noname.eventspb@gmail.com</a></div>
          <div><span>Адрес фестиваля МЖ</span><p>«{event.venue}»<br />{event.city}, {event.address}<br />Метро «{event.metro}»<br />{event.dateLabel} · {event.timeLabel}</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Фестиваль «Мужчина и Женщина»</span><a href="/gifts/">Подарки для купивших билеты</a><a href="#">Вернуться к началу</a></div>
      </footer>

      {selectedSpeaker && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedSpeaker(null)}>
          <article className="speaker-modal" role="dialog" aria-modal="true" aria-labelledby="speaker-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSpeaker(null)} aria-label="Закрыть">×</button>
            <div className={`modal-visual ${selectedSpeaker.tone}${selectedSpeaker.image ? " has-photo" : ""}`}>
              {selectedSpeaker.image ? (
                <img src={selectedSpeaker.image} alt={selectedSpeaker.name} style={{ objectPosition: selectedSpeaker.imagePosition }} />
              ) : (
                <span>{selectedSpeaker.initials}</span>
              )}
            </div>
            <div className="modal-copy">
              <p className="section-label">Участник фестиваля</p>
              <h2 id="speaker-modal-title">{selectedSpeaker.name}</h2>
              <p className="modal-role">{selectedSpeaker.role}</p>
              {selectedSpeaker.stage && <div className="modal-topic"><span>Тема выступления</span><strong>{selectedSpeaker.topic ?? "Тема требует согласования"}</strong></div>}
              {selectedSpeaker.note && <p className="festival-pending">{selectedSpeaker.note}</p>}
              {selectedSpeaker.description && <p className="modal-description">{selectedSpeaker.description}</p>}
              {selectedSpeaker.facts.length > 0 && <ul>{selectedSpeaker.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}
              <div className="participant-formats">{selectedSpeaker.appearances.map((appearance) => <article key={appearance.label}><h4>{appearance.label}</h4><p>{appearance.text}</p>{appearance.note && <p className="festival-pending">{appearance.note}</p>}</article>)}</div>
              <div className="speaker-project-links">{selectedSpeaker.links?.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>
            </div>
          </article>
        </div>
      )}

      {cookieVisible && (
        <div className="cookie-banner">
          <p>Мы используем только необходимые cookie для корректной работы сайта.</p>
          <button onClick={acceptCookies}>Понятно</button>
        </div>
      )}
    </main>
  );
}
