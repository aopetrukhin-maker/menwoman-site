import { consultations, expoGroups, workshops, type FestivalCard } from "./festival-content";
import "./festival-sections.css";

function Cards({ cards }: { cards: FestivalCard[] }) {
  return <div className="festival-card-grid">{cards.map((card) => (
    <article className="festival-info-card" key={card.name}>
      <h4>{card.name}</h4>
      <p>{card.text}</p>
      {card.note && <p className="festival-pending">{card.note}</p>}
      {card.link && <a href={card.link.href} target="_blank" rel="noreferrer">{card.link.label} ↗</a>}
    </article>
  ))}</div>;
}

export function ExpoSection() {
  return <section className="section expo-section" id="expo">
    <div className="container">
      <div className="section-heading center-heading">
        <p className="section-label">Знакомиться · пробовать · выбирать</p>
        <h2>Экспозона <span>Люди, бренды и практики</span></h2>
        <p>Знакомство со специалистами, авторскими проектами и их подходами. Форматы, отмеченные в карточках, ещё уточняются.</p>
      </div>
      {expoGroups.map((group, index) => <div className="festival-group" key={group.title}>
        <div className="festival-group-heading"><span>{String(index + 1).padStart(2, "0")}</span><h3>{group.title}</h3></div>
        <Cards cards={group.cards} />
      </div>)}
    </div>
  </section>;
}

export function ConsultationsSection() {
  return <section className="section consultations-section" id="consultations">
    <div className="container">
      <div className="section-heading center-heading">
        <p className="section-label">Консультации и практики</p>
        <h2>Не только послушать. <span>Разобрать свою ситуацию с экспертом</span></h2>
        <p>В экспертных зонах фестиваля можно будет познакомиться со специалистами, задать личные вопросы, принять участие в практиках и получить рекомендации по своей ситуации. Формат и доступность каждой встречи уточняются.</p>
      </div>
      <h3 className="festival-subheading">Индивидуальные встречи и разборы</h3>
      <Cards cards={consultations} />
      <h3 className="festival-subheading">Практики и мастер-классы</h3>
      <Cards cards={workshops} />
      <p className="festival-schedule-note">Время, продолжительность, количество участников и способ записи для всех активностей ещё необходимо подтвердить. Бесплатный формат, подарки и сертификаты, упомянутые в анкетах, пока не являются подтверждёнными условиями участия.</p>
    </div>
  </section>;
}
