import type { FestivalParticipant } from "./festival-participants";

export default function ParticipantPortrait({ participant }: { participant: FestivalParticipant }) {
  return <div className={`participant-portrait ${participant.image ? "has-photo" : "has-initials"}`}>{participant.image ? <img src={participant.image} alt={participant.name} loading="lazy" style={{ objectPosition: participant.imagePosition }} /> : <span aria-label={participant.name}>{participant.initials}</span>}</div>;
}
