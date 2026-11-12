import { speakers } from "./festival-content";
import { participantProfiles, type FestivalParticipant } from "./festival-participants";

export default function FestivalProgramme({ onSelect }: { onSelect: (participant: FestivalParticipant) => void }) {
  const confirmed = speakers.filter((speaker) => speaker.topic);
  const additional = speakers.filter((speaker) => !speaker.topic);
  return <section className="section programme-section primary-section" id="program"><div className="container" id="speakers">
    <div className="section-heading split-heading"><div><p className="section-label">02 / Программа и спикеры</p><h2>Разговоры <span>о важном в отношениях</span></h2></div><p>Три согласованные темы. Время выступлений и остальная программа будут опубликованы после согласования.</p></div>
    <div className="programme-grid">{confirmed.map((speaker, index) => <article className="programme-feature" key={speaker.name}>
      <span className="programme-index">{String(index + 1).padStart(2, "0")} / Выступление</span><h3>{speaker.topic}</h3>
      <button className="programme-person" type="button" onClick={() => onSelect(participantProfiles[speaker.name])} aria-label={`Об эксперте: ${speaker.name}`}><span className="programme-avatar">{speaker.image ? <img src={speaker.image} alt="" loading="lazy" style={{ objectPosition: speaker.imagePosition }} /> : speaker.initials}</span><span><strong>{speaker.name}</strong><small>{speaker.role}</small><em>Об эксперте ↗</em></span></button>
      {speaker.note && <p className="programme-note">{speaker.note}</p>}
    </article>)}</div>
    <details className="additional-speakers"><summary>Все спикеры фестиваля <span>Ещё {additional.length} экспертов · темы согласуются</span><b aria-hidden="true">+</b></summary><div className="compact-speaker-grid">{additional.map((speaker) => <button className="speaker-card-compact" key={speaker.name} type="button" onClick={() => onSelect(participantProfiles[speaker.name])}><span className="compact-speaker-avatar">{speaker.image ? <img src={speaker.image} alt="" loading="lazy" /> : speaker.initials}</span><span><strong>{speaker.name}</strong><small>{speaker.role}</small><em>Тема требует согласования</em></span><b aria-hidden="true">↗</b></button>)}</div></details>
  </div></section>;
}
