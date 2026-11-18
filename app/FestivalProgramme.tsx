import { speakers } from "./festival-content";
import { participantProfiles, type FestivalParticipant } from "./festival-participants";
import FestivalCarousel from "./FestivalCarousel";
import ParticipantPortrait from "./ParticipantPortrait";

export default function FestivalProgramme({ onSelect, onConsultation }: { onSelect: (participant: FestivalParticipant) => void; onConsultation: (name: string) => void }) {
  return <section className="section programme-section primary-section" id="program"><div className="container" id="speakers">
    <div className="section-heading split-heading conversion-section-heading"><div><p className="section-label">03 / Программа и спикеры</p><h2>Выберите тему,<br /><span>ради которой придёте</span></h2></div><p>Близость, отношения, внутренняя опора и новые возможности. Выберите спикера, которого хотите услышать лично.</p></div>
    <div className="section-offer-strip"><div><strong>Услышьте эксперта лично</strong><span>Живые выступления и возможность продолжить разговор на фестивале.</span></div><a href="#pricing" data-cta-location="program-offer">Выбрать билет</a></div>
    <FestivalCarousel label="Спикеры фестиваля" className="speakers-carousel">{speakers.map((speaker, index) => <article className={`city-speaker ${speaker.topic ? "topic-confirmed" : "topic-pending"}`} key={speaker.name}>
      <ParticipantPortrait participant={participantProfiles[speaker.name]} />
      <div className="speaker-card-topline"><span>{String(index + 1).padStart(2, "0")} / МЖ · Спикер</span></div>
      {speaker.topic ? <><h3 className="speaker-offer">{speaker.topic}</h3><p className="speaker-person">{speaker.name}</p><p className="city-speaker-role">{speaker.role}</p></> : <><h3>{speaker.name}</h3><p className="city-speaker-role">{speaker.role}</p><p className="city-speaker-topic">Тему объявим после согласования</p></>}
      {speaker.note && <p className="programme-note">{speaker.note}</p>}
      <button className="participant-link" type="button" onClick={() => onSelect(participantProfiles[speaker.name])}>О спикере и выступлении</button>
      <button className="consultation-request-button" type="button" onClick={() => onConsultation(speaker.name)}>Оставить запрос на консультацию</button>
    </article>)}</FestivalCarousel>
    <p className="city-fine-print">Время выступлений и оставшиеся темы программы объявим после согласования.</p>
    <div className="recruitment-callout"><div><small>Есть тема для сцены?</small><strong>Станьте спикером МЖ</strong><p>Расскажите о себе и теме выступления команде фестиваля.</p></div><a className="recruitment-button" href="https://t.me/redheadlitle" target="_blank" rel="noreferrer" data-cta-location="speakers">Стать спикером</a></div>
  </div></section>;
}
