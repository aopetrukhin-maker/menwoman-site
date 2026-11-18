import type { FestivalParticipant } from "./festival-participants";

export default function ParticipantPortrait({ participant }: { participant: FestivalParticipant }) {
  return <div className={`participant-portrait ${participant.image ? "has-photo" : "has-initials"}`}>{participant.image ? participant.imageSecondary ? <div className="participant-duo"><img src={participant.image} alt="Саша Бочар" loading="lazy" /><img src={participant.imageSecondary} alt="Олег Гром" loading="lazy" /></div> : <img src={participant.image} alt={participant.name} loading="lazy" style={{ objectPosition: participant.imagePosition }} /> : <span aria-label={participant.name}>{participant.initials}</span>}</div>;
}
