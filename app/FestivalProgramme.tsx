import { speakers } from "./festival-content";
import { participantProfiles, type FestivalParticipant } from "./festival-participants";
import { useState } from "react";
import FestivalCarousel from "./FestivalCarousel";
import ParticipantPortrait from "./ParticipantPortrait";

const categories = [
  { label: "Все темы" },
  { label: "Отношения в паре", names: ["Светлана Лапухина", "Анна Рацун", "Елена Гусева", "Ольга Васильева", "Ольга Жильникова", "Екатерина Тистол"] },
  { label: "Секс и близость", names: ["Анна Рацун", "Ольга Жильникова", "Ольга Васильева"] },
  { label: "Знакомства", names: ["Татьяна Щербакова", "Виктория Орженевская", "Мария Рубинская", "Екатерина Тистол"] },
  { label: "Звуковая практика", names: ["Саша Бочар и Олег Гром"] },
];
const priority = ["Анна Рацун", "Ольга Васильева", "Виктория Орженевская", "Мария Рубинская"];
const order = [...priority, ...speakers.map(speaker => speaker.name).filter(name => !priority.includes(name))];

export default function FestivalProgramme({ onSelect, onConsultation }: { onSelect: (participant: FestivalParticipant, trigger: HTMLElement) => void; onConsultation: (name: string, trigger: HTMLElement) => void }) {
  const [category, setCategory] = useState(0);
  const names = categories[category].names;
  const results = speakers.filter(speaker => !names || names.includes(speaker.name)).sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  return <section className="section programme-section primary-section" id="program"><div className="container" id="speakers">
    <div className="section-heading conversion-section-heading">
      <div><h2>Программа и спикеры</h2><p>Выступления и прожарки в формате живых разборов. В программе обсуждаем близость, отношения в паре и знакомства.</p></div>
    </div>
    <div className="review-filters" role="group" aria-label="Темы выступлений">{categories.map(({ label }, index) =>
      <button type="button" key={label} aria-pressed={category === index} onClick={() => setCategory(index)}>{label}</button>)}</div>
    <p className="city-fine-print" id="programme-consultation-note">Запрос на консультацию не подтверждает запись. Команда отвечает по телефону или в Telegram.</p>
    <FestivalCarousel key={category} label="Спикеры фестиваля" className="speakers-carousel">{results.map((speaker) => <article className={`city-speaker ${speaker.topic ? "topic-confirmed" : "topic-pending"}`} key={speaker.name}>
      <ParticipantPortrait participant={participantProfiles[speaker.name]} />
      {speaker.topic ? <><h3 className="speaker-offer">{speaker.topic}</h3><p className="speaker-person">{speaker.name}</p><p className="city-speaker-role">{speaker.role}</p></> : <><h3>{speaker.name}</h3><p className="city-speaker-role">{speaker.role}</p><p className="city-speaker-topic">Тему объявим после согласования</p></>}
      {speaker.note && <p className="programme-note">{speaker.note}</p>}
      <button className="participant-link" type="button" onClick={event => onSelect(participantProfiles[speaker.name], event.currentTarget)}>О выступлении</button>
      <button className="consultation-request-button" type="button" aria-describedby="programme-consultation-note" onClick={event => onConsultation(speaker.name, event.currentTarget)}>Оставить запрос на консультацию</button>
    </article>)}</FestivalCarousel>
    <p className="city-fine-print">Время выступлений объявим отдельно.</p>
  </div></section>;
}
