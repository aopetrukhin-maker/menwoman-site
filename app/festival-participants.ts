import { speakers, expoGroups, consultations, type Speaker, type FestivalCard } from "./festival-content";

export type FestivalParticipant = Speaker & { stage?: boolean; poster?: boolean; appearances: { label: string; text: string; note?: string }[] };
const profiles: Record<string, FestivalParticipant> = Object.fromEntries(speakers.map((speaker) => [speaker.name, { ...speaker, stage: true, appearances: [] }]));

const suppliedRoles: Record<string, string> = {
  "Мечислав Жильцов": "Психолог, мастер гвоздестояния",
  "Валерия Мирсалимова": "Семейный психолог",
  "Татьяна Пронина": "Семейный психолог, эмоциональный терапевт",
  "Яна Якушева": "Дизайнер украшений ручной работы",
  "Юлия Кропивницкая": "Стильные восточные изделия от «Узбекские халаты»",
};
const suppliedImages: Record<string, string> = {
  "Катрин Голубка": "/speakers/katrin-golubka.webp",
  "Мечислав Жильцов": "/speakers/mechislav-zhiltsov.webp",
  "Татьяна Пронина": "/speakers/tatyana-pronina.webp",
  "Валерия Мирсалимова": "/speakers/valeria-mirsalimova-cutout.png",
  "Яна Якушева": "/exhibitors/yana-yakusheva.jpeg",
  "Юлия Кропивницкая": "/exhibitors/yulia-kropivnitskaya.jpeg",
};

function add(cards: FestivalCard[], label: string) {
  for (const card of cards) {
    profiles[card.name] ??= { name: card.name, role: card.role ?? suppliedRoles[card.name] ?? "Участник фестиваля", facts: [], tone: "rose", initials: card.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join(""), image: suppliedImages[card.name], imagePosition: card.name === "Мечислав Жильцов" ? "center 13%" : undefined, poster: card.poster, links: card.link ? [card.link] : [], appearances: [] };
    profiles[card.name].appearances.push({ label, text: card.text, note: card.note });
    if (card.link && !profiles[card.name].links?.some((link) => link.href === card.link?.href)) profiles[card.name].links = [...(profiles[card.name].links ?? []), card.link];
  }
}
for (const group of expoGroups) add(group.cards, `Выставка · ${group.title}`);
add(consultations, "Экспертная зона · консультации и личные разборы");
export const participantProfiles = profiles;
