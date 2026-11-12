import { speakers } from "./festival-content";
import { participantProfiles, type FestivalParticipant } from "./festival-participants";
import FestivalCarousel from "./FestivalCarousel";
import ParticipantPortrait from "./ParticipantPortrait";

export default function FestivalProgramme({ onSelect }: { onSelect: (participant: FestivalParticipant) => void }) {
  return <section className="section programme-section primary-section" id="program"><div className="container" id="speakers">
    <div className="section-heading split-heading"><div><p className="section-label">04 / Программа и спикеры</p><h2>Разговоры, которые<br /><span>касаются вашей жизни</span></h2></div><p>О близости и деньгах. О кризисах в паре. О любви, новых начинаниях и возможности выбирать себя в любом возрасте. Спикеры МЖ делятся опытом и подходами к вопросам, с которыми люди приходят к ним в практику.</p></div>
    <FestivalCarousel label="Спикеры фестиваля" className="speakers-carousel">{speakers.map((speaker, index) => <article className={`city-speaker ${speaker.topic ? "topic-confirmed" : "topic-pending"}`} key={speaker.name}>
      <div className="speaker-card-topline"><span>{String(index + 1).padStart(2, "0")} / МЖ</span></div>
      <ParticipantPortrait participant={participantProfiles[speaker.name]} />
      <h3>{speaker.name}</h3><p className="city-speaker-role">{speaker.role}</p><p className="city-speaker-topic">{speaker.topic ?? "Тема требует согласования"}</p>
      {speaker.note && <p className="programme-note">{speaker.note}</p>}
      <button className="participant-link" type="button" onClick={() => onSelect(participantProfiles[speaker.name])}>Подробнее об эксперте</button>
    </article>)}</FestivalCarousel>
    <p className="city-fine-print">Три согласованные темы — в начале списка. Время выступлений и остальная программа будут опубликованы после согласования.</p>
  </div></section>;
}
