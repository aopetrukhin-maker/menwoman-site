"use client";

import { useState } from "react";
import { consultations, expoGroups, workshops, type FestivalCard } from "./festival-content";
import { participantProfiles, type FestivalParticipant } from "./festival-participants";
import FestivalCarousel from "./FestivalCarousel";
import ParticipantPortrait from "./ParticipantPortrait";
import "./festival-sections.css";

type Props = { onSelect: (participant: FestivalParticipant) => void };
function ProfileAction({ card, onSelect }: { card: FestivalCard } & Props) {
  return <button type="button" className="participant-link" onClick={() => onSelect(participantProfiles[card.name])}>Подробнее об участнике</button>;
}
export function FestivalConsultations({ onSelect }: Props) {
  return <section className="section city-consultations primary-section" id="consultations"><div className="container">
    <div className="section-heading split-heading consultation-heading"><div><p className="section-label">05 / Личный разговор</p><h2>Получите <span>бесплатную консультацию</span> прямо на фестивале</h2><p className="consultation-badge">Для гостей фестиваля · по доступности специалистов</p></div><div><p>Вопрос, который не хочется задавать со сцены, можно обсудить лично. Выберите специалиста по своей теме и подойдите в консультационную зону.</p><p>Близость, отношения, границы и внутренняя опора — начните с того, что волнует именно вас.</p></div></div>
    <FestivalCarousel label="Специалисты и личные разборы" className="consultations-carousel">{consultations.map((card) => <article className="city-consultant festival-info-card" key={card.name}><ParticipantPortrait participant={participantProfiles[card.name]} /><p className="consultant-eyebrow">Личный разговор на фестивале</p><h3>{card.hook ?? card.name}</h3><p className="consultant-name">{card.name}</p><p>{card.text}</p>{card.note && <p className="festival-pending">{card.note}</p>}<ProfileAction card={card} onSelect={onSelect} /></article>)}</FestivalCarousel>
    <p className="festival-schedule-note">Консультации для гостей бесплатны. Расписание, длительность, число мест и запись объявим после подтверждения. Отдельные подарочные форматы указаны в карточках вместе с условиями.</p>
    <details className="festival-disclosure city-workshops" id="consultation-workshops"><summary>Практики и мастер-классы<small>{workshops.length} направления</small><b aria-hidden="true">+</b></summary><div className="festival-card-grid">{workshops.map((card) => <article className="festival-info-card" key={card.name}><h4>{card.name}</h4><p>{card.text}</p><p className="festival-pending">Время, продолжительность, число участников и условия записи необходимо подтвердить.</p><ProfileAction card={card} onSelect={onSelect} /></article>)}</div></details>
    <a className="primary-button consultation-apply" href="#application-form" data-cta-location="consultations">Подать заявку на фестиваль</a>
  </div></section>;
}
export default function FestivalExhibition({ onSelect }: Props) {
  const [category, setCategory] = useState("Все участники");
  const cards = expoGroups.filter((group) => category === "Все участники" || category === group.title).flatMap((group) => group.cards.map((card) => ({ ...card, category: group.title })));
  const exhibition = expoGroups.find((group) => group.title === "Товары, стиль и творчество")?.cards ?? [];
  return <section className="section city-exhibition primary-section" id="expo"><div className="container">
    <div className="section-heading split-heading"><div><p className="section-label">06 / Выставка и экспозона</p><h2>Найдите вещь с историей.<br /><span>Познакомьтесь с её автором.</span></h2></div><p>Примерьте украшение, подберите аромат, откройте новый проект или подход к отношениям. Здесь можно задавать вопросы создателям лично и унести с собой впечатление от встречи.</p></div>
    <div className="exhibition-feature"><div className="exhibition-feature-image" role="img" aria-label="Вечерний интерьер ресторана «Антресоль и Перец»" /><div className="exhibition-feature-content"><p className="exhibition-feature-kicker">Выставка внутри фестиваля</p><h3>Вещи, которые хочется<br /><em>рассмотреть вблизи</em></h3><p>Встречайте авторов лично. Примерьте украшение, познакомьтесь с ароматом, найдите вещь с характером — и узнайте историю, которая за ней стоит.</p><div className="exhibition-feature-list">{exhibition.map((card, index) => <button type="button" key={card.name} onClick={() => onSelect(participantProfiles[card.name])}><small>{String(index + 1).padStart(2, "0")}</small><strong>{card.name}</strong><span>{index === 0 ? "Украшения из натуральных камней" : index === 1 ? "Индивидуальные ароматы" : "Халаты в узбекском стиле"}</span></button>)}</div></div></div>
    <div className="expo-filters" role="group" aria-label="Направления экспозоны">{["Все участники", ...expoGroups.map((group) => group.title)].map((title) => <button key={title} type="button" aria-pressed={category === title} onClick={() => setCategory(title)}>{title}</button>)}</div>
    <FestivalCarousel key={category} label="Участники экспозоны" className="expo-carousel">{cards.map((card) => <article className="city-exhibitor festival-info-card" key={card.name}><ParticipantPortrait participant={participantProfiles[card.name]} /><span className="exhibitor-category">{card.category}</span><h3>{card.hook ?? card.name}</h3><p className="exhibitor-name">{card.name}</p><p>{card.text}</p>{card.note && <p className="festival-pending">{card.note}</p>}<ProfileAction card={card} onSelect={onSelect} />{card.link && <a href={card.link.href} target="_blank" rel="noreferrer">{card.link.label}</a>}</article>)}</FestivalCarousel>
    <p className="city-fine-print">Мастер-классы, демонстрации и другие активности указываются в карточках после согласования условий.</p>
  </div></section>;
}
