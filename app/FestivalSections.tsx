"use client";

import { consultations, expoGroups, type FestivalCard } from "./festival-content";
import { participantProfiles, type FestivalParticipant } from "./festival-participants";
import FestivalCarousel from "./FestivalCarousel";
import ParticipantPortrait from "./ParticipantPortrait";
import "./festival-sections.css";

type Props = { onSelect: (participant: FestivalParticipant) => void; onConsultation?: (name: string) => void };
function ProfileAction({ card, onSelect }: { card: FestivalCard } & Props) {
  return <button type="button" className="participant-link" onClick={() => onSelect(participantProfiles[card.name])}>Подробнее об участнике</button>;
}
export function FestivalConsultations({ onSelect, onConsultation }: Props) {
  return <section className="section city-consultations primary-section" id="consultations"><div className="container">
    <div className="section-heading split-heading consultation-heading conversion-section-heading"><div><p className="section-label">04 / Экспертная зона</p><h2>Получите <span>бесплатную консультацию</span> прямо на фестивале</h2><p className="consultation-badge">Лично · для гостей фестиваля · при наличии свободных мест</p></div><div><p>Отношения, близость, границы, самооценка - выберите специалиста и обсудите свой вопрос без микрофона и сцены.</p></div></div>
    <FestivalCarousel label="Специалисты и личные разборы" className="consultations-carousel">{consultations.map((card) => <article className="city-consultant festival-info-card" key={card.name}><ParticipantPortrait participant={participantProfiles[card.name]} /><p className="consultant-eyebrow">Личный разговор на фестивале</p><h3>{card.hook ?? card.name}</h3><p className="consultant-name">{card.name}</p><p>{card.text}</p>{card.note && <p className="festival-pending">{card.note}</p>}<ProfileAction card={card} onSelect={onSelect} />{onConsultation && <button className="consultation-request-button" type="button" onClick={() => onConsultation(card.name)}>Оставить запрос на консультацию</button>}</article>)}</FestivalCarousel>
    <p className="festival-schedule-note">Консультации для гостей бесплатны. Расписание, длительность, число мест и запись объявим после подтверждения. Отдельные подарочные форматы указаны в карточках вместе с условиями.</p>
    <div className="recruitment-callout"><div><small>Вы работаете с людьми?</small><strong>Станьте экспертом МЖ</strong><p>Расскажите о своей практике и обсудите формат участия в экспертной зоне.</p></div><a className="recruitment-button" href="https://t.me/redheadlitle" target="_blank" rel="noreferrer" data-cta-location="expert-zone">Стать экспертом</a></div>
  </div></section>;
}
export default function FestivalExhibition({ onSelect }: Props) {
  const exhibition = expoGroups[0].cards;
  return <section className="section city-exhibition primary-section" id="expo"><div className="container">
    <div className="exhibition-marquee" aria-label="Выставка: приходите, примеряйте, пробуйте"><div className="exhibition-marquee-track" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <span key={index}>ПРИХОДИ <b>•</b> ПРИМЕРЯЙ <b>•</b> ПРОБУЙ <b>•</b> ЗНАКОМЬСЯ <b>•</b> </span>)}</div></div>
    <div className="section-heading split-heading conversion-section-heading"><div><p className="section-label">05 / Выставка МЖ</p><h2>Примерьте, попробуйте<br /><span>и найдите своё</span></h2></div><p>Украшения, ароматы, вещи и идеи. Рассмотрите их вживую и познакомьтесь с авторами.</p></div>
    <div className="exhibition-invitation"><p><strong>Выставка пополняется.</strong> Здесь можно не только смотреть: знакомьтесь с авторами, примеряйте украшения и выбирайте ароматы.</p><a className="recruitment-button" href="https://t.me/redheadlitle" target="_blank" rel="noreferrer" data-cta-location="exhibition-top">Стать участником выставки</a></div>
    <div className="exhibition-feature"><div className="exhibition-feature-image" role="img" aria-label="Вечерний интерьер ресторана «Антресоль и Перец»" /><div className="exhibition-feature-content"><p className="exhibition-feature-kicker">Выставка внутри фестиваля</p><h3>Вещи, которые хочется<br /><em>рассмотреть вблизи</em></h3><p>Встречайте авторов лично. Примерьте украшение, познакомьтесь с ароматом, найдите вещь с характером - и узнайте историю, которая за ней стоит.</p><div className="exhibition-feature-list">{exhibition.map((card, index) => <button type="button" key={card.name} onClick={() => onSelect(participantProfiles[card.name])}><small>{String(index + 1).padStart(2, "0")}</small><strong>{card.name}</strong><span>{index === 0 ? "Украшения из натуральных камней" : index === 1 ? "Индивидуальные ароматы" : "Стильные восточные изделия"}</span></button>)}</div></div></div>
    <FestivalCarousel label="Участники выставки" className="expo-carousel">{exhibition.map((card) => <article className="city-exhibitor festival-info-card" key={card.name}><ParticipantPortrait participant={participantProfiles[card.name]} /><span className="exhibitor-category">Выставка</span><h3>{card.hook ?? card.name}</h3><p className="exhibitor-name">{card.name}</p><p>{card.text}</p>{card.note && <p className="festival-pending">{card.note}</p>}<ProfileAction card={card} onSelect={onSelect} />{card.link && <a href={card.link.href} target="_blank" rel="noreferrer">{card.link.label}</a>}</article>)}</FestivalCarousel>
    <p className="city-fine-print">Мастер-классы, демонстрации и другие активности указываются в карточках после согласования условий.</p>
    <a className="recruitment-button exhibition-bottom-cta" href="https://t.me/redheadlitle" target="_blank" rel="noreferrer" data-cta-location="exhibition-bottom">Стать участником выставки</a>
  </div></section>;
}
