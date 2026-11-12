import { consultations, expoGroups, workshops, type FestivalCard } from "./festival-content";
import { participantProfiles, type FestivalParticipant } from "./festival-participants";
import "./festival-sections.css";

function Cards({ cards, onSelect }: { cards: FestivalCard[]; onSelect: (participant: FestivalParticipant) => void }) {
  return <div className="festival-card-grid">{cards.map((card) => <article className="festival-info-card" key={card.name}>
    <h4>{card.name}</h4><p>{card.text}</p>
    {card.note && <p className="festival-pending">{card.note}</p>}
    <button type="button" className="participant-link" onClick={() => onSelect(participantProfiles[card.name])}>Об участнике и его форматах ↗</button>
    {card.link && <a href={card.link.href} target="_blank" rel="noreferrer">{card.link.label} ↗</a>}
  </article>)}</div>;
}

export default function FestivalActivities({ onSelect }: { onSelect: (participant: FestivalParticipant) => void }) {
  return <section className="section activities-section primary-section" id="expo"><div className="container">
    <div className="section-heading split-heading"><div><p className="section-label">03 / За пределами сцены</p><h2>Познакомиться, <span>попробовать, выбрать</span></h2></div><p>Экспозона, консультации и практики собраны по интересам. Откройте направление, чтобы увидеть участников и условия.</p></div>
    <h3 className="activity-heading">Экспозона — люди, бренды и практики</h3>
    {expoGroups.map((group) => <details className="festival-disclosure festival-group" key={group.title}>
      <summary>{group.title}<small>{group.cards.length} участников</small><b aria-hidden="true">+</b></summary><Cards cards={group.cards} onSelect={onSelect} />
    </details>)}
    <div className="activity-consultations" id="consultations">
      <h3 className="activity-heading">Консультации и практики</h3>
      <p className="activity-intro">Не только послушать. Разобрать свою ситуацию с экспертом. В экспертных зонах фестиваля можно будет познакомиться со специалистами, задать личные вопросы, принять участие в практиках и получить рекомендации по своей ситуации. Формат и доступность каждой встречи уточняются.</p>
      <details className="festival-disclosure"><summary>Индивидуальные встречи и разборы<small>{consultations.length} экспертов</small><b aria-hidden="true">+</b></summary><Cards cards={consultations} onSelect={onSelect} /></details>
      <details className="festival-disclosure"><summary>Практики и мастер-классы<small>{workshops.length} эксперта</small><b aria-hidden="true">+</b></summary><Cards cards={workshops} onSelect={onSelect} /></details>
      <p className="festival-schedule-note">Время, продолжительность, количество участников и способ записи ещё необходимо подтвердить. Бесплатный формат, подарки и сертификаты, упомянутые в анкетах, пока не являются подтверждёнными условиями участия.</p>
    </div>
  </div></section>;
}
