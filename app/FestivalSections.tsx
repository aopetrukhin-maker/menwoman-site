"use client";

import { consultations, expoGroups, type FestivalCard } from "./festival-content";
import { participantProfiles, type FestivalParticipant } from "./festival-participants";
import FestivalCarousel from "./FestivalCarousel";
import ParticipantPortrait from "./ParticipantPortrait";
import "./festival-sections.css";

type Props = { onSelect: (participant: FestivalParticipant, trigger: HTMLElement) => void; onConsultation?: (name: string, trigger: HTMLElement) => void };
function ProfileAction({ card, onSelect }: { card: FestivalCard } & Props) {
  return <button type="button" className="participant-link" onClick={event => onSelect(participantProfiles[card.name], event.currentTarget)}>Подробнее об участнике</button>;
}
export function FestivalConsultations({ onSelect, onConsultation }: Props) {
  return <section className="section city-consultations primary-section" id="consultations"><div className="container">
    <div className="section-heading consultation-heading" id="choose-psychologist">
      <h2>Бесплатная консультация с психологом</h2>
      <p>Можно выбрать психолога для бесплатной консультации или другого специалиста для личного разбора. Количество мест ограничено. После запроса команда фестиваля свяжется с вами по телефону или в Telegram, чтобы уточнить возможность встречи.</p>
      {onConsultation && <div className="review-request">
        <label htmlFor="expert-select">Выбрать специалиста</label>
        <select id="expert-select" value="" onChange={event => {
          if (event.currentTarget.value) onConsultation(event.currentTarget.value, event.currentTarget);
        }}>
          <option value="">Выберите из списка</option>
          {consultations.map(card => <option key={card.name} value={card.name}>{card.name}</option>)}
        </select>
      </div>}
    </div>
    <FestivalCarousel label="Специалисты и личные разборы" className="consultations-carousel">{consultations.map((card) => <article className="city-consultant festival-info-card" key={card.name}><ParticipantPortrait participant={participantProfiles[card.name]} /><h3>{card.hook ?? card.name}</h3><p className="consultant-name">{card.name}</p>{onConsultation && <button className="consultation-request-button" type="button" onClick={event => onConsultation(card.name, event.currentTarget)}>Оставить запрос на консультацию</button>}<ProfileAction card={card} onSelect={onSelect} /><p>{card.text}</p>{card.note && <p className="festival-pending">{card.note}</p>}</article>)}</FestivalCarousel>
  </div></section>;
}
export default function FestivalExhibition({ onSelect }: Props) {
  const exhibition = expoGroups[0].cards;
  return <section className="section city-exhibition primary-section" id="expo"><div className="container">
    <div className="section-heading"><h2>Украшения, ароматы и авторские вещи</h2><p>Посмотрите работы, примерьте украшения и познакомьтесь с авторами.</p></div>
    <FestivalCarousel label="Участники выставки" className="expo-carousel">{exhibition.map((card) => <article className="city-exhibitor festival-info-card" key={card.name}><ParticipantPortrait participant={participantProfiles[card.name]} /><h3>{card.hook ?? card.name}</h3><p className="exhibitor-name">{card.name}</p><p>{card.text}</p>{card.note && <p className="festival-pending">{card.note}</p>}<ProfileAction card={card} onSelect={onSelect} />{card.link && <a href={card.link.href} target="_blank" rel="noreferrer">{card.link.label}</a>}</article>)}</FestivalCarousel>
    <p className="city-fine-print">Мастер-классы, демонстрации и другие активности указываются в карточках после согласования условий.</p>
  </div></section>;
}
