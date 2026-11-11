"use client";

import { useEffect, useRef, useState } from "react";
import HeroAnimation from "./HeroAnimation";
import { ExpoSection, ConsultationsSection } from "./FestivalSections";
import { speakers, type Speaker } from "./festival-content";

type ConnectionCode = "dialogue" | "support" | "spark" | "space" | "depth";
type ConnectionStatus = "search" | "relationship" | "complicated" | "self";
type TicketTier = "start" | "reload" | "vip";
type PurchaseMode = "single" | "pair";

type SaleStage = {
  id: string;
  label: string;
  deadline: string | null;
  deadlineLabel: string;
  remaining: number;
  quota: number;
  prices: Record<TicketTier, number>;
  closed?: boolean;
};

type SaleSnapshot = {
  stageIndex: number;
  millisecondsLeft: number;
};

type ConnectionAnswer = {
  label: string;
  note: string;
  scores: Partial<Record<ConnectionCode, number>>;
};

type ConnectionQuestion = {
  eyebrow: string;
  question: string;
  answers: ConnectionAnswer[];
};

const ticketUrl = "https://qtickets.ru/event/246143?base_color=ea1e63";
const telegramUrl = "https://t.me/redheadlitle";

const saleStages: SaleStage[] = [
  {
    id: "early",
    label: "Текущая цена",
    deadline: "2026-08-16T23:59:59+03:00",
    deadlineLabel: "16 августа в 23:59 МСК",
    remaining: 34,
    quota: 120,
    prices: { start: 990, reload: 1990, vip: 3990 },
  },
  {
    id: "regular",
    label: "Основная цена",
    deadline: "2026-08-21T23:59:59+03:00",
    deadlineLabel: "21 августа в 23:59 МСК",
    remaining: 58,
    quota: 150,
    prices: { start: 1490, reload: 2990, vip: 5990 },
  },
  {
    id: "final",
    label: "Продажа открыта",
    deadline: "2026-08-22T20:00:00+03:00",
    deadlineLabel: "22 августа в 20:00 МСК",
    remaining: 40,
    quota: 200,
    prices: { start: 1490, reload: 2990, vip: 5900 },
  },
  {
    id: "closed",
    label: "Онлайн-продажа завершена",
    deadline: null,
    deadlineLabel: "Регистрация открыта на площадке",
    remaining: 0,
    quota: 0,
    prices: { start: 1490, reload: 2990, vip: 5900 },
    closed: true,
  },
];

const formatPrice = (price: number) => `${new Intl.NumberFormat("ru-RU").format(price)} ₽`;

const getPairTotalPrice = (tier: TicketTier, price: number) => tier === "vip" && price === 5900 ? 8380 : Math.floor((price * 1.4) / 10) * 10;

const formatTicketCount = (count: number) => {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const suffix = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? "билетов"
    : lastDigit === 1
      ? "билет"
      : lastDigit >= 2 && lastDigit <= 4
        ? "билета"
        : "билетов";
  return `${count} ${suffix}`;
};

const formatPairCount = (count: number) => {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const suffix = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? "пар"
    : lastDigit === 1
      ? "пара"
      : lastDigit >= 2 && lastDigit <= 4
        ? "пары"
        : "пар";
  return `${count} ${suffix}`;
};

const getSaleStageIndex = (now: number) => {
  const activeIndex = saleStages.findIndex((stage) => (
    stage.deadline
    && stage.remaining > 0
    && now < new Date(stage.deadline).getTime()
  ));
  return activeIndex === -1 ? saleStages.length - 1 : activeIndex;
};

const getCountdownParts = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

const formats = [
  {
    number: "01",
    title: "Выступления",
    benefit: "Понять причины",
    text: "Эксперты представят свои подходы к отношениям, близости и самореализации. Темы выступлений — в программе.",
  },
  {
    number: "02",
    title: "Практики",
    benefit: "Попробовать сразу",
    text: "Интерактивы и упражнения помогут не только услышать идеи, но и применить их к своей ситуации.",
  },
  {
    number: "03",
    title: "Знакомства",
    benefit: "Начать разговор",
    text: "Браслеты и вопросы о ценностях снимают неловкость и помогают знакомиться без пустых переписок.",
  },
  {
    number: "04",
    title: "Личные разборы",
    benefit: "Получить свой ответ",
    text: "В экспертной зоне можно познакомиться со специалистами и обсудить свой запрос. Форматы и доступность встреч уточняются.",
  },
  {
    number: "05",
    title: "Подарки",
    benefit: "Продолжить после",
    text: "В старших тарифах - подарки и сертификаты партнёров на сумму до 100 000 ₽.",
  },
];

const audience = [
  {
    number: "01",
    label: "Если вы в поиске отношений",
    title: "Новый союз без старых сценариев",
    image: "/stories/audience-search.webp",
    points: ["Поймете, почему выбираете «не тех»", "Определите критерии подходящего партнера"],
  },
  {
    number: "02",
    label: "Если вы в отношениях",
    title: "Пара как команда, а не поле борьбы",
    image: "/stories/audience-conflict.webp",
    points: ["Увидите свой сценарий конфликтов", "Найдёте шаг к доверию и близости"],
  },
  {
    number: "03",
    label: "Если хотите понять себя",
    title: "Перестать жить по старому сценарию",
    image: "/stories/career-tired.webp",
    points: ["Поймете, куда уходит энергия", "Соберёте конкретный следующий шаг"],
  },
];

const connectionStatusOptions: { value: ConnectionStatus; label: string; note: string }[] = [
  { value: "search", label: "Я сейчас в поиске", note: "Хочу понимать, с кем мне действительно по пути" },
  { value: "relationship", label: "Я в отношениях", note: "Хочу лучше понимать наш союз и друг друга" },
  { value: "complicated", label: "У меня всё сложно", note: "Хочу увидеть ситуацию яснее и без самообмана" },
  { value: "self", label: "Хочу понять себя", note: "Без привязки к текущему статусу отношений" },
];

const connectionQuestions: ConnectionQuestion[] = [
  {
    eyebrow: "Начало отношений",
    question: "Что быстрее всего создаёт у вас ощущение: «этому человеку можно открыться»?",
    answers: [
      { label: "Он говорит прямо", note: "Нет игр, догадок и двойных смыслов", scores: { dialogue: 3, depth: 1 } },
      { label: "Он остаётся рядом", note: "Я вижу заботу и последовательность в поступках", scores: { support: 3, dialogue: 1 } },
      { label: "Между нами возникает энергия", note: "Хочется смеяться, двигаться и проживать новое", scores: { spark: 3, depth: 1 } },
      { label: "Он не пытается меня присвоить", note: "Есть интерес, но остаётся воздух и свобода", scores: { space: 3, support: 1 } },
    ],
  },
  {
    eyebrow: "После конфликта",
    question: "Как вам проще всего вернуться к близости после сложного разговора?",
    answers: [
      { label: "Разобрать всё словами", note: "Понять, что произошло и о чём договорились", scores: { dialogue: 3, support: 1 } },
      { label: "Сначала выдохнуть отдельно", note: "Мне нужно пространство, чтобы услышать себя", scores: { space: 3, depth: 1 } },
      { label: "Почувствовать тепло", note: "Объятие или тихое присутствие важнее аргументов", scores: { support: 3, depth: 1 } },
      { label: "Сменить обстановку", note: "Совместное действие помогает выйти из тяжести", scores: { spark: 3, dialogue: 1 } },
    ],
  },
  {
    eyebrow: "Настоящая близость",
    question: "В какой момент вы сильнее всего чувствуете связь с человеком?",
    answers: [
      { label: "Когда говорим до ночи", note: "И можно обсуждать то, что обычно прячут", scores: { depth: 3, dialogue: 2 } },
      { label: "Когда строим общее", note: "Планы, дом, проект или понятное будущее", scores: { support: 3, dialogue: 1 } },
      { label: "Когда нас захватывает жизнь", note: "Путешествие, танец, приключение, новое впечатление", scores: { spark: 3, space: 1 } },
      { label: "Когда можем быть разными", note: "Близость не требует отказаться от самого себя", scores: { space: 3, depth: 1 } },
    ],
  },
  {
    eyebrow: "Красная линия",
    question: "Что в отношениях ранит или отталкивает вас сильнее всего?",
    answers: [
      { label: "Недосказанность", note: "Когда приходится угадывать намерения и чувства", scores: { dialogue: 3, depth: 1 } },
      { label: "Ненадёжность", note: "Когда слова и реальные поступки не совпадают", scores: { support: 3, dialogue: 1 } },
      { label: "Холод и рутина", note: "Когда отношения перестают быть живыми", scores: { spark: 3, support: 1 } },
      { label: "Контроль", note: "Когда любовь превращается в ограничения и отчёты", scores: { space: 3, spark: 1 } },
    ],
  },
  {
    eyebrow: "Идеальный день вдвоём",
    question: "Какой сценарий звучит для вас наиболее притягательно?",
    answers: [
      { label: "Разговор без телефонов", note: "Время, где мы действительно слышим друг друга", scores: { dialogue: 2, depth: 3 } },
      { label: "Совместное маленькое дело", note: "Приготовить ужин, обустроить дом, помочь друг другу", scores: { support: 3, depth: 1 } },
      { label: "Спонтанная поездка", note: "Неизвестный маршрут и общее приключение", scores: { spark: 3, space: 1 } },
      { label: "Вместе, но каждый в своём ритме", note: "Можно читать, работать или молчать рядом", scores: { space: 3, support: 1 } },
    ],
  },
  {
    eyebrow: "Ваш человек",
    question: "По какому признаку вы скорее поймёте, что встретили «своего» человека?",
    answers: [
      { label: "Мы умеем договариваться", note: "Даже сложные темы не разрушают контакт", scores: { dialogue: 3, support: 1 } },
      { label: "Рядом становится спокойнее", note: "Мне не нужно постоянно доказывать свою ценность", scores: { support: 3, depth: 1 } },
      { label: "Рядом хочется жить смелее", note: "Мы усиливаем интерес друг друга к жизни", scores: { spark: 3, space: 1 } },
      { label: "Я могу оставаться собой", note: "Меня не уменьшают ради удобства отношений", scores: { space: 3, depth: 2 } },
    ],
  },
];

const connectionResults: Record<ConnectionCode, {
  label: string;
  title: string;
  summary: string;
  scenario: string;
  strength: string;
  partner: string;
  blindSpot: string;
  steps: string[];
}> = {
  dialogue: {
    label: "Диалог",
    title: "Вам по пути с теми, с кем можно говорить прямо",
    summary: "Вам важны ясность намерений, честные слова и ощущение, что сложную тему можно обсудить, не разрушая контакт.",
    scenario: "Вы сближаетесь через разговор и ясность. Если человек уходит от прямых ответов, вы быстро теряете ощущение безопасности и начинаете искать скрытый смысл.",
    strength: "Вы умеете называть сложное словами, договариваться и возвращать отношениям определённость.",
    partner: "Эмоционально доступный человек, который не играет в молчание, умеет обсуждать конфликт и подтверждает слова поступками.",
    blindSpot: "Вы можете слишком долго искать окончательную определённость и принимать чужую осторожность за отсутствие интереса.",
    steps: [
      "Не требуйте полной определённости в первые дни - оценивайте последовательность человека, а не скорость признаний.",
      "Перед сложным разговором формулируйте один конкретный запрос вместо списка накопленных претензий.",
      "Смотрите, умеет ли человек не только говорить, но и менять поведение после договорённости.",
    ],
  },
  support: {
    label: "Опора",
    title: "Вы выбираете любовь, которую видно в поступках",
    summary: "Вам нужны надёжность, последовательность и партнёрство, в котором двое не конкурируют, а создают устойчивую общую жизнь.",
    scenario: "Вы проявляете любовь через заботу и реальные действия. В отношениях легко становитесь тем, на ком держится быт, планы и эмоциональная устойчивость пары.",
    strength: "Рядом с вами спокойно: вы надёжны, внимательны и умеете создавать устойчивость без громких обещаний.",
    partner: "Самостоятельный и последовательный человек, который умеет принимать заботу, но не перекладывает на вас ответственность за свою жизнь.",
    blindSpot: "Иногда вы можете брать на себя слишком много ответственности и незаметно превращать заботу в контроль.",
    steps: [
      "Перед помощью спрашивайте: человек просит поддержки или вы спасаете его от последствий собственного выбора.",
      "Разделите постоянные обязанности пары и перестаньте молча компенсировать чужую безответственность.",
      "Оценивайте взаимность не по словам благодарности, а по регулярным действиям партнёра.",
    ],
  },
  spark: {
    label: "Искра",
    title: "Вам нужна связь, в которой жизнь становится ярче",
    summary: "Вас сближают энергия, телесность, юмор и новые впечатления. В отношениях для вас важно не только спокойствие, но и живое желание.",
    scenario: "Вы быстро чувствуете химию и оживаете рядом с человеком, который приносит движение, юмор и новые впечатления. Рутина для вас опаснее открытого конфликта.",
    strength: "Вы умеете наполнять союз энергией, проявлять желание и превращать обычную жизнь в совместное приключение.",
    partner: "Живой, инициативный и телесно открытый человек, который любит новое, но способен выдерживать обязательства и повседневность.",
    blindSpot: "Сильное притяжение может казаться доказательством совместимости раньше, чем вы успеете увидеть ценности и надёжность человека.",
    steps: [
      "Не принимайте сильную химию за готовую совместимость - проверьте ценности, границы и отношение к обязательствам.",
      "Планируйте одно новое совместное впечатление каждую неделю, не дожидаясь, пока отношения станут скучными.",
      "Говорите о желании прямо, а не проверяйте любовь партнёра через дистанцию и провокации.",
    ],
  },
  space: {
    label: "Пространство",
    title: "Вы ищете близость, в которой не нужно терять себя",
    summary: "Для вас любовь совместима со свободой, личным ритмом и уважением границ. Вам важно, чтобы союз расширял жизнь обоих.",
    scenario: "Вы цените связь, но плохо переносите контроль и слияние. Когда партнёр требует постоянного подтверждения любви, вам хочется отойти и восстановить внутреннюю свободу.",
    strength: "Вы уважаете индивидуальность, не душите близостью и умеете строить отношения двух самостоятельных людей.",
    partner: "Уверенный в себе человек с собственной жизнью, который способен быть близко без контроля, ревности и постоянной проверки чувств.",
    blindSpot: "За самостоятельностью иногда может прятаться страх показать потребность в другом человеке или попросить о поддержке.",
    steps: [
      "Заранее объясняйте, сколько личного времени вам нужно и что дистанция не означает отказ от отношений.",
      "Тренируйтесь просить о конкретной помощи до того, как усталость превратится в холодность.",
      "Отличайте нарушение границ от обычной потребности партнёра в контакте и ясности.",
    ],
  },
  depth: {
    label: "Глубина",
    title: "Вам важна встреча не ролей, а настоящих людей",
    summary: "Вы ищете смысл, эмоциональную честность и возможность быть увиденным целиком — не только сильным, удобным или успешным.",
    scenario: "Вы редко удовлетворяетесь поверхностной симпатией. Вам важно быстро почувствовать эмоциональную правду человека и понять, можно ли рядом показать уязвимую часть себя.",
    strength: "Вы способны видеть человека глубже роли, создавать доверие и выдерживать разговоры, которых другие избегают.",
    partner: "Эмоционально зрелый человек, который не боится уязвимости, но умеет сохранять лёгкость и не превращает близость в бесконечный анализ.",
    blindSpot: "Вы можете ждать мгновенной глубины и недооценивать отношения, которым нужно время, лёгкость и совместный опыт.",
    steps: [
      "Давайте отношениям время: надёжная глубина часто растёт медленнее сильного эмоционального узнавания.",
      "Добавляйте в общение действие, юмор и телесность, чтобы близость не превращалась в постоянный разбор чувств.",
      "Проверяйте, способен ли человек выдерживать вашу правду, не требуя мгновенного полного раскрытия.",
    ],
  },
};

const connectionStatusCopy: Record<ConnectionStatus, string> = {
  search: "На фестивале цвет браслета поможет увидеть, кто открыт к знакомству. А ваш код и вопросы для разговора помогут быстрее перейти от формальностей к ценностям и намерениям.",
  relationship: "Пройдите тест вдвоём и сравните результаты. На фестивале программа даст вам общий контекст, чтобы обсудить близость, деньги, конфликты и будущее без привычного сценария.",
  complicated: "Ваш результат не принимает решение за вас, но даёт язык для честного разговора. На фестивале вы сможете посмотреть на ситуацию через разные подходы экспертов.",
  self: "Понимание своего кода помогает замечать подходящих людей и не соглашаться на связь, в которой приходится отказываться от себя.",
};

const partners = [
  { name: "Грелка", image: "/partners/grelka.webp" },
  { name: "Кипенский гриб", image: "/partners/kipensky-grib.webp" },
  { name: "Secret", image: "/partners/secret.webp" },
  { name: "Montana", image: "/partners/montana.webp" },
  { name: "Нуждички", image: "/partners/nuzhdichki.webp" },
  { name: "RR Corporation", image: "/partners/rr-corporation.webp" },
  { name: "SMOOTH Lifestyle Radio", image: "/partners/smooth-radio.webp" },
  { name: "Взлёт", image: "/partners/vzlet.webp" },
  { name: "Линчевская Юлиана", image: "/partners/linchevskaya.webp" },
  { name: "Только по делу", image: "/partners/tolko.jpg" },
  { name: "Дворец Кваренги", image: "/partners/quarenghi.jpg" },
  { name: "Body Impulse", image: "/partners/bi.png" },
  { name: "Хвойный квас", image: "/partners/hvoyny-kvas.webp" },
  { name: "Журнал SOK - Стиль. Образ. Качество жизни", image: "/partners/sok-magazine.webp" },
  { name: "Центр просвещения и досуга «СюрПриз»", image: "/partners/surpriz.webp" },
  { name: "Философия Здоровья доктора К. С. Суханова", image: "/partners/philosophy-health-sukhanov.jpg" },
  { name: "LEVEL UP - Свидание в Темноте", image: "/partners/level-up-date-in-dark.svg" },
];

const attendees = [
  { name: "Юлия", age: 27, reason: "Иду за новыми знаниями в психологии отношений и эмоциями.", image: "/attendees/yulia-27.webp" },
  { name: "Анастасия", age: 20, reason: "Прихожу за вдохновением, интересна психология личного развития.", image: "/attendees/anastasia-20.webp" },
  { name: "Савва", age: 24, reason: "Иду в надежде обрести чудесные знакомства и близких единомышленников.", image: "/attendees/savva-24.webp" },
  { name: "Полина", age: 24, reason: "Хочу добавить в свои отношения гармонии, а также найти новые способы саморазвития.", image: "/attendees/polina-24.webp" },
  { name: "Алексей", age: 34, reason: "Мне интересна тема личного развития и внутренней трансформации. Такие события помогают понять, что моя работа необходима людям.", image: "/attendees/alexey-34.webp" },
  { name: "Соня", age: 26, reason: "Хочу обрести стабильность и гармонию в отношениях.", image: "/attendees/sonya-26.webp" },
  { name: "Максим", age: 27, reason: "Хочу найти точку роста и научиться сохранять стабильность во всех сферах жизни.", image: "/attendees/maxim-27.webp" },
  { name: "Алина", age: 36, reason: "Мне интересно всё, что связано с личным развитием. Люблю слушать разных психологов и находить новые инсайты.", image: "/attendees/alina-36.webp" },
  { name: "Анна", age: 26, reason: "Иду за эмоциями, а эмоции - это для меня счастье.", image: "/attendees/anna-26.webp" },
  { name: "Диана", age: 27, reason: "Иду весело провести оставшиеся дни лета, обзавестись новыми знакомствами и узнать что-то новое.", image: "/attendees/diana-27.webp" },
  { name: "Юлия", age: 27, reason: "Наступает новый период жизни, поэтому я открыта новым знакомствам и полезной информации по психологии.", image: "/attendees/yulia2-27.webp" },
  { name: "Маргарита", age: 23, reason: "Надоело тратить время на сайтах знакомств - хочется живого общения.", image: "/attendees/margarita-23.webp" },
  { name: "Вадим", age: 29, reason: "Иду за новыми знакомствами.", image: "/attendees/vadim-29.webp" },
  { name: "Вероника", age: 23, reason: "Иду за вдохновением, новыми знакомствами и яркими впечатлениями!", image: "/attendees/veronika-23.webp" },
  { name: "Александр", age: 27, reason: "Хочу разнообразить свою рутину.", image: "/attendees/alexander-27.webp" },
  { name: "Ксения", age: 23, reason: "Хочу добавить в жизнь красок.", image: "/attendees/ksenia-23.webp" },
  { name: "Елена", age: 38, reason: "Мне интересна тема взаимоотношений. Предпочитаю общение вживую и стараюсь постоянно развиваться.", image: "/attendees/elena-38.webp" },
  { name: "Евгения", age: 45, reason: "Мне интересна психология отношений и живые знакомства.", image: "/attendees/evgenia-45.webp" },
  { name: "Глеб", age: 27, reason: "Хочу стать ещё более привлекательным для своей партнёрши и увидеть свои ошибки в стратегии заработка.", image: "/attendees/gleb-27.webp" },
  { name: "Кристина", age: 25, reason: "Хочу пойти на фестиваль, прихожу за вдохновением и новыми знакомствами.", image: "/attendees/kristina-25.svg" },
];

const tickets = [
  {
    name: "Старт",
    tier: "start" as TicketTier,
    price: "990 ₽",
    note: "Количество билетов по этой цене ограничено",
    visualLabel: "Входит в стоимость",
    visualValue: "Полный день",
    visualNote: "Весь фестивальный день и основные форматы",
    mockupImage: "/visuals/tariff-start-v2.webp",
    mockupAlt: "Билет на фестиваль и доступ ко всем основным форматам",
    mockupItems: [
      { title: "Билет", note: "Весь фестивальный день" },
      { title: "Все форматы", note: "Выступления, практики и знакомства" },
    ],
    highlights: ["Вход на весь день", "Все выступления", "Все основные форматы"],
    nextPrice: "1 490 ₽",
    finalPrice: "1 990 ₽",
    description: "Для тех, кто хочет познакомиться с фестивалем, послушать экспертов и провести насыщенный день.",
    items: [
      "Вход на фестиваль на весь день",
      "Доступ ко всем выступлениям основной сцены",
      "Участие в общих практиках и интерактивах",
      "Доступ в экспертные и бренд-зоны",
      "Знакомства и открытый нетворкинг",
      "Электронная программа фестиваля",
    ],
  },
  {
    name: "Перезагрузка",
    tier: "reload" as TicketTier,
    price: "1 990 ₽",
    note: "Самый выгодный тариф",
    visualLabel: "Всё включено + бонусы",
    visualValue: "до 50 000 ₽",
    visualNote: "Приоритетный доступ и подарки партнёров",
    mockupImage: "/visuals/tariff-reload-v2.webp",
    mockupAlt: "Билет, приоритетный доступ и подарочные сертификаты",
    mockupItems: [
      { title: "Приоритет", note: "Зона перед сценой и быстрая регистрация" },
      { title: "до 50 000 ₽", note: "Подарки и сертификаты" },
    ],
    highlights: ["Подарки до 50 000 ₽", "Мини-диагностики: формат уточняется", "Приоритетная зона"],
    nextPrice: "2 990 ₽",
    finalPrice: "3 990 ₽",
    description: "Для тех, кто хочет активно включиться, поработать со своими запросами и получить максимум пользы.",
    featured: true,
    items: [
      "Вход на фестиваль на весь день",
      "Доступ ко всем выступлениям основной сцены",
      "Участие в общих практиках и интерактивах",
      "Доступ в экспертные и бренд-зоны",
      "Знакомства и открытый нетворкинг",
      "Электронная программа фестиваля",
      "Места в приоритетной зоне перед сценой",
      "Отдельная быстрая регистрация без общей очереди",
      "Доступность и условия практик с ограниченным числом мест уточняются",
      "Формат мини-диагностик и возможность предварительного выбора уточняются",
      "Индивидуальная корзина подарков и сертификатов на сумму до 50 000 ₽",
      "Доступ в закрытый Telegram-чат участников",
      "Полезные материалы от спикеров после события",
    ],
  },
  {
    name: "VIP",
    tier: "vip" as TicketTier,
    price: "3 990 ₽",
    note: "Количество мест строго ограничено",
    visualLabel: "Максимум включено + бонусы",
    visualValue: "до 100 000 ₽",
    visualNote: "Расширенный набор подарков и VIP-привилегии",
    mockupImage: "/visuals/tariff-vip-v2.webp",
    mockupAlt: "VIP-билет, закрытый нетворкинг и расширенный набор подарков",
    mockupItems: [
      { title: "Закрытый нетворкинг", note: "Со спикерами и партнёрами" },
      { title: "до 100 000 ₽", note: "Подарки и сертификаты" },
      { title: "VIP-доступ", note: "Первые ряды и закрытый нетворкинг" },
    ],
    highlights: ["Подарки до 100 000 ₽", "Закрытый нетворкинг", "VIP-доступ и первые ряды"],
    nextPrice: "5 990 ₽",
    finalPrice: "7 990 ₽",
    description: "Максимальный уровень участия, личного общения и комфорта на фестивале.",
    items: [
      "Вход на фестиваль на весь день и доступ ко всем выступлениям",
      "Участие во всех общих практиках и интерактивах",
      "Доступ в экспертные и бренд-зоны",
      "Электронная программа фестиваля",
      "Лучшие места в первых рядах",
      "Отдельная VIP-регистрация",
      "Закрытая встреча и нетворкинг со спикерами, партнёрами и организаторами",
      "Условия и способ записи на экспертные разборы уточняются",
      "Увеличенная корзина подарков и сертификатов на сумму до 100 000 ₽",
      "Доступ в закрытый Telegram-чат участников",
      "Полезные материалы от спикеров после события",
      "Профессиональные фотографии с площадки",
      "Приглашение на закрытые встречи проекта после фестиваля",
    ],
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function HeartHandsIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 51.5 12.8 33.8C5.2 26.7 7.1 14 17.3 11.2c6.2-1.7 11.2 1.5 14.7 6.2 3.5-4.7 8.5-7.9 14.7-6.2 10.2 2.8 12.1 15.5 4.5 22.6L32 51.5Z" />
      <path d="M12.5 43.5c6.5 3.6 12.3 5.4 19.5 5.4M51.5 43.5c-6.5 3.6-12.3 5.4-19.5 5.4" />
    </svg>
  );
}


function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function BonusSection() {
  return (
    <section className="section bonus-section" id="bonuses">
      <div className="container">
        <div className="bonus-hero">
          <div className="bonus-copy">
            <p className="section-label">Подарки партнёров</p>
            <h2>Больше пользы <span>после фестиваля</span></h2>
            <p className="bonus-lead">С тарифа «Перезагрузка» вы получаете подарки и сертификаты партнёров, которые можно выбрать под себя.</p>
          </div>
          <div className="bonus-tiers" aria-label="Подарки по тарифам">
            <article><span>Перезагрузка</span><h3>Индивидуальный набор</h3><strong>до 50 000 ₽</strong><p>подарков и сертификатов</p></article>
            <article className="bonus-tier-vip"><span>VIP</span><h3>Максимальный набор</h3><strong>до 100 000 ₽</strong><p>подарков и сертификатов</p></article>
          </div>
        </div>

        <div className="bonus-grid bonus-grid-compact" aria-label="Категории подарков">
          <article><span>01</span><h3>SPA</h3></article>
          <article><span>02</span><h3>Здоровье</h3></article>
          <article><span>03</span><h3>Рестораны</h3></article>
          <article><span>04</span><h3>Консультации</h3></article>
          <article><span>05</span><h3>Обучение</h3></article>
          <article><span>06</span><h3>Товары брендов</h3></article>
        </div>
        <p className="bonus-footnote">Состав каталога зависит от подтверждённых предложений партнёров. Конкретные услуги, сроки действия и доступность выбора будут указаны в каталоге фестиваля.</p>
      </div>
    </section>
  );
}

function AttendeeSection() {
  const attendeeCards = attendees.map((attendee) => (
    <article className="attendee-card" key={`${attendee.name}-${attendee.age}-${attendee.image}`}>
      <img src={attendee.image} alt={`${attendee.name}, ${attendee.age}`} loading="lazy" />
      <div>
        <span>Я иду на фестиваль</span>
        <h3>{attendee.name}, {attendee.age}</h3>
        <p>{attendee.reason}</p>
      </div>
    </article>
  ));

  return (
    <section className="attendees-section" aria-labelledby="attendees-title">
      <div className="container attendees-heading">
        <p className="section-label">Люди, которых вы встретите</p>
        <h2 id="attendees-title">Я иду <span>на фестиваль</span></h2>
        <p>У каждого своя причина. Но все придут за живыми эмоциями, новыми знаниями и настоящим общением.</p>
      </div>
      <div className="attendees-marquee">
        <div className="attendees-track">
          <div className="attendees-group">{attendeeCards}</div>
          <div className="attendees-group" aria-hidden="true">{attendeeCards}</div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [saleSnapshot, setSaleSnapshot] = useState<SaleSnapshot | null>(null);
  const [calculatorTier, setCalculatorTier] = useState<TicketTier>("reload");
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>("single");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const updateSaleState = () => {
      const now = Date.now();
      const stageIndex = getSaleStageIndex(now);
      const stage = saleStages[stageIndex];
      setSaleSnapshot({
        stageIndex,
        millisecondsLeft: stage.deadline ? Math.max(0, new Date(stage.deadline).getTime() - now) : 0,
      });
    };

    updateSaleState();
    const timer = window.setInterval(updateSaleState, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const activeStageIndex = saleSnapshot?.stageIndex ?? 0;
  const activeStage = saleStages[activeStageIndex];
  const nextStage = saleStages[Math.min(activeStageIndex + 1, saleStages.length - 1)];
  const countdown = getCountdownParts(saleSnapshot?.millisecondsLeft ?? 0);
  const selectedTicket = tickets.find((ticket) => ticket.tier === calculatorTier) ?? tickets[1];
  const currentSinglePrice = activeStage.prices[calculatorTier];
  const nextSinglePrice = nextStage.prices[calculatorTier];
  const currentPairPrice = getPairTotalPrice(calculatorTier, currentSinglePrice);
  const nextPairPrice = getPairTotalPrice(calculatorTier, nextSinglePrice);
  const currentUnitPrice = purchaseMode === "pair" ? currentPairPrice : currentSinglePrice;
  const nextUnitPrice = purchaseMode === "pair" ? nextPairPrice : nextSinglePrice;
  const currentTotal = currentUnitPrice * quantity;
  const nextTotal = nextUnitPrice * quantity;
  const stageSavings = Math.max(0, nextTotal - currentTotal);
  const pairSavings = purchaseMode === "pair"
    ? Math.max(0, (currentSinglePrice * 2 - currentUnitPrice) * quantity)
    : 0;
  const progress = activeStage.quota > 0
    ? Math.max(0, Math.min(100, ((activeStage.quota - activeStage.remaining) / activeStage.quota) * 100))
    : 100;
  const purchaseUrl = activeStage.closed
    ? `${telegramUrl}?text=${encodeURIComponent("Хочу уточнить наличие билетов на фестиваль МЖ")}`
    : ticketUrl;
  const cardPurchaseUrl = purchaseUrl;

  const selectPairTicket = (tier: TicketTier) => {
    setCalculatorTier(tier);
    setPurchaseMode("pair");
    setQuantity(1);
    window.requestAnimationFrame(() => {
      document.getElementById("ticket-calculator")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const selectPairPurchase = () => {
    setPurchaseMode("pair");
    setQuantity(1);
    window.requestAnimationFrame(() => {
      document.getElementById("ticket-calculator")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <section className="section pricing-section" id="pricing" data-release="ticket-fomo-live-2026-08-04">
      <div className="container">
        <div className="section-heading center-heading">
          <p className="section-label">Билеты</p>
          <h2>Выберите <span>формат участия</span></h2>
          <p>Главная разница видна сразу. Полный состав можно открыть внутри карточки.</p>
        </div>

        <article className="charity-impact-card" id="charity-impact" aria-labelledby="charity-impact-title">
          <div className="charity-impact-stat" aria-label="Пять процентов с каждого билета">
            <strong>5%</strong>
            <span>с каждого билета</span>
          </div>
          <div className="charity-impact-copy">
            <p className="charity-impact-label">Благотворительный партнёр фестиваля</p>
            <h3 id="charity-impact-title">Каждый билет - вклад в помощь детям</h3>
            <p>
              5% с продажи каждого билета на фестиваль «Мужчина и Женщина. Перезагрузка»
              мы передадим благотворительному фонду «Энби». Фонд помогает детям с диагнозом
              «нейробластома» и их семьям по всей России.
            </p>
            <p className="charity-impact-fact">Каждую неделю в среднем шесть российских семей узнают об этом диагнозе у своего ребёнка.</p>
            <div className="charity-impact-links">
              <a href="https://neuroblastoma.help/" target="_blank" rel="noreferrer">Подробнее о фонде <i className="button-icon"><ArrowIcon /></i></a>
              <a href="https://www.instagram.com/neuroblastoma_family" target="_blank" rel="noreferrer">Instagram фонда</a>
            </div>
          </div>
          <div className="charity-impact-logo">
            <img src="/partners/enbi.png" alt="Благотворительный фонд Энби" loading="lazy" />
            <span>Первое в России объединение родителей детей с нейробластомой</span>
          </div>
        </article>

        <button className="pair-ticket-banner" type="button" onClick={selectPairPurchase} aria-controls="ticket-calculator">
          <span>Новый формат</span>
          <div>
            <strong>Парные билеты -30%</strong>
            <p>Два билета одного тарифа дешевле. Приходите с партнёром, другом, подругой, родственником или коллегой.</p>
          </div>
          <b>Выбрать парный билет <i className="button-icon"><ArrowIcon /></i></b>
        </button>

        <div className={`sale-fomo-panel${activeStage.closed ? " is-closed" : ""}`} key={activeStage.id}>
          <div className="sale-fomo-status">
            <div className="sale-stage-line">
              <span>{activeStage.closed ? "Продажи" : `Этап ${activeStageIndex + 1} из 3`}</span>
              <strong>{activeStage.label}</strong>
            </div>
            <div className="sale-countdown-title">
              {!activeStage.closed && (
                <span className="ticking-clock" role="img" aria-label="Часы идут">
                  <i />
                  <b />
                </span>
              )}
              <h3>{activeStage.closed ? "Онлайн-продажа завершена" : "До повышения цены"}</h3>
            </div>
            <p>
              {activeStage.closed
                ? "Уточните наличие билетов у организатора или приобретите билет на регистрации."
                : `${activeStage.deadlineLabel} или раньше, если закончится лимит этого этапа.`}
            </p>

            <div className="sale-countdown" aria-label="Обратный отсчёт до изменения цены" aria-live="polite">
              {[
                [countdown.days, "дней"],
                [countdown.hours, "часов"],
                [countdown.minutes, "минут"],
                [countdown.seconds, "секунд"],
              ].map(([value, label]) => (
                <span key={label}>
                  <b suppressHydrationWarning>{String(value).padStart(2, "0")}</b>
                  <small>{label}</small>
                </span>
              ))}
            </div>

            {!activeStage.closed && (
              <div className="sale-limit">
                <div><span>Лимит этапа</span><strong>Осталось {formatTicketCount(activeStage.remaining)}</strong></div>
                <div className="sale-limit-track"><i style={{ width: `${progress}%` }} /></div>
                <p>Цена изменится автоматически по окончании таймера.</p>
              </div>
            )}
          </div>

          <div className={`price-calculator${purchaseMode === "pair" ? " is-pair" : ""}`} id="ticket-calculator" aria-label="Покупка билетов">
            <div className="price-calculator-heading">
              <span>Билеты</span>
              <h3>{purchaseMode === "pair" ? "Купить парный билет" : "Купить билет"}</h3>
            </div>

            <div className="purchase-mode-switch" role="group" aria-label="Формат покупки">
              <button
                className={purchaseMode === "single" ? "is-active" : ""}
                type="button"
                aria-pressed={purchaseMode === "single"}
                onClick={() => setPurchaseMode("single")}
              >
                Один билет
              </button>
              <button
                className={purchaseMode === "pair" ? "is-active" : ""}
                type="button"
                aria-pressed={purchaseMode === "pair"}
                onClick={() => setPurchaseMode("pair")}
              >
                Парный билет <b>-30%</b>
              </button>
            </div>

            <div className="calculator-tiers" role="group" aria-label="Выберите тариф">
              {tickets.map((ticket) => (
                <button
                  className={calculatorTier === ticket.tier ? "is-active" : ""}
                  type="button"
                  key={ticket.tier}
                  onClick={() => setCalculatorTier(ticket.tier)}
                >
                  <span>{ticket.name}<small>{purchaseMode === "pair" ? "за двоих" : "за билет"}</small></span>
                  <strong>
                    {formatPrice(purchaseMode === "pair"
                      ? getPairTotalPrice(ticket.tier, activeStage.prices[ticket.tier])
                      : activeStage.prices[ticket.tier])}
                  </strong>
                </button>
              ))}
            </div>

            <div className="calculator-quantity">
              <span>{purchaseMode === "pair" ? "Количество пар" : "Количество билетов"}</span>
              <div>
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Уменьшить количество">−</button>
                <strong>{quantity}</strong>
                <button type="button" onClick={() => setQuantity((current) => Math.min(10, current + 1))} aria-label="Увеличить количество">+</button>
              </div>
            </div>

            {purchaseMode === "pair" ? (
              <>
                <div className="calculator-result pair-result">
                  <div><span>{quantity === 1 ? "Итого за 2 билета" : `Итого за ${formatTicketCount(quantity * 2)}`}</span><strong>{formatPrice(currentTotal)}</strong></div>
                  <div><span>Для сравнения - за человека</span><strong>{formatPrice(currentPairPrice / 2)}</strong></div>
                </div>
                <p className="calculator-saving pair-saving">Ваша выгода - {formatPrice(pairSavings)}</p>
                {!activeStage.closed && activeStageIndex < saleStages.length - 2 && (
                  <p className="calculator-next-price">После повышения - {formatPrice(nextTotal)} за {quantity === 1 ? "двоих" : formatPairCount(quantity)}</p>
                )}
              </>
            ) : (
              <>
                <div className="calculator-result">
                  <div><span>Сейчас к оплате</span><strong>{formatPrice(currentTotal)}</strong></div>
                  {!activeStage.closed && activeStageIndex < saleStages.length - 2 && (
                    <div><span>После повышения</span><strong>{formatPrice(nextTotal)}</strong></div>
                  )}
                </div>
                {!activeStage.closed && stageSavings > 0 && (
                  <p className="calculator-saving">Покупка сейчас экономит {formatPrice(stageSavings)}</p>
                )}
              </>
            )}

            <a href={purchaseUrl} target="_blank" rel="noreferrer">
              {purchaseMode === "pair"
                  ? `Купить ${formatTicketCount(quantity * 2)} за ${formatPrice(currentTotal)}`
                  : `Выбрать «${selectedTicket.name}»`}
              <i className="button-icon"><ArrowIcon /></i>
            </a>
          </div>
        </div>

        <div className="pricing-grid">
          {tickets.map((ticket) => (
            <article className={`price-card price-card-${ticket.tier} ${ticket.featured ? "featured" : ""}`} key={ticket.name}>
              {ticket.featured && <div className="popular">Самый выгодный</div>}
              <div className="price-head">
                <h3>{ticket.name}</h3>
                <strong className="dynamic-ticket-price" key={`${activeStage.id}-${ticket.tier}`}>{formatPrice(activeStage.prices[ticket.tier])}</strong>
                <span>{activeStage.closed ? "Уточните наличие у организатора" : "Цена за 1 билет"}</span>
              </div>
              <div className={`ticket-product-scene ticket-product-scene-${ticket.tier}`}>
                <div className="ticket-product-art" role="img" aria-label={ticket.mockupAlt}>
                  <div className="ticket-product-pass">
                    <span>МЖ · 22.08.2026</span>
                    <strong>{ticket.name}</strong>
                    <small>Дворец Кваренги</small>
                  </div>
                  <div className="ticket-product-benefits">
                    {ticket.mockupItems.map((item) => (
                      <span key={item.title}><b>{item.title}</b><small>{item.note}</small></span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ticket-highlight-list">
                {ticket.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
              </div>
              <details className="ticket-details">
                <summary>Полный состав тарифа <b>+</b></summary>
                <ul>{ticket.items.map((item) => <li className={item.includes("50 000") || item.includes("100 000") ? "gift-highlight" : ""} key={item}><b>✓</b>{item}</li>)}</ul>
              </details>
              <div className="price-timeline">
                <span>{activeStage.closed || activeStageIndex >= saleStages.length - 2 ? "Текущая цена" : "После повышения"} <b>{formatPrice(activeStage.closed || activeStageIndex >= saleStages.length - 2 ? activeStage.prices[ticket.tier] : nextStage.prices[ticket.tier])}</b></span>
                <span>Финальная цена <b>{ticket.finalPrice}</b></span>
              </div>
              {!activeStage.closed && (
                <button className="pair-card-link" type="button" onClick={() => selectPairTicket(ticket.tier)}>
                  2 билета - {formatPrice(getPairTotalPrice(ticket.tier, activeStage.prices[ticket.tier]))} за двоих
                </button>
              )}
              <a href={cardPurchaseUrl} target="_blank" rel="noreferrer">{activeStage.closed ? "Уточнить наличие" : "Купить билет"} <i className="button-icon"><ArrowIcon /></i></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramSection() {
  return (
    <section className="section program-section" id="program">
      <div className="container">
        <div className="section-heading split-heading">
          <div><p className="section-label">Программа фестиваля</p><h2>Темы <span>выступлений</span></h2></div>
          <p>Публикуем согласованные темы. Остальные темы и расписание уточняются.</p>
        </div>
        <div className="program-list">
          {speakers.filter((speaker) => speaker.topic).map((speaker, index) => (
            <article className="program-card" key={speaker.name}>
              <div className="program-confirmed-talk">
                <span className="program-number">{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{speaker.topic}</h3><p>{speaker.name}</p></div>
              </div>
            </article>
          ))}
        </div>
        <p className="program-note">Время выступлений и темы остальных спикеров будут опубликованы после согласования.</p>
      </div>
    </section>
  );
}

function SpeakersSection({
  trackRef,
  onSelect,
  onScroll,
}: {
  trackRef: { current: HTMLDivElement | null };
  onSelect: (speaker: Speaker) => void;
  onScroll: (direction: -1 | 1) => void;
}) {
  return (
    <>
      <section className="section speakers-section" id="speakers">
        <div className="container">
          <div className="section-heading center-heading">
            <p className="section-label">Психологи · сексологи · коучи · терапевты</p>
            <h2>Спикеры <span>фестиваля</span></h2>
            <p>Знакомьтесь с экспертами фестиваля. Три темы согласованы; остальные отмечены как уточняемые. Нажмите на карточку, чтобы узнать больше.</p>
          </div>
          <div className="speakers-track" ref={trackRef}>
            {speakers.map((speaker, index) => (
              <button className="speaker-card" key={speaker.name} onClick={() => onSelect(speaker)}>
                <div className={`speaker-visual ${speaker.tone}${speaker.image ? " has-photo" : ""}`}>
                  {speaker.image && <img src={speaker.image} alt={speaker.name} loading="lazy" style={{ objectPosition: speaker.imagePosition }} />}
                  <span className="speaker-index">{String(index + 1).padStart(2, "0")}</span>
                  {!speaker.image && <strong>{speaker.initials}</strong>}
                  <span className="speaker-open"><ArrowIcon /></span>
                  <span className="speaker-action">Нажмите - подробнее</span>
                </div>
                <div className="speaker-card-copy">
                  <h3>{speaker.name}</h3>
                  <p>{speaker.role}</p>
                  <span className={`speaker-topic${speaker.topic ? "" : " is-pending"}`}>{speaker.topic ? `Тема: ${speaker.topic}` : "Тема требует согласования"}</span>
                  {speaker.facts[0] && <strong className="speaker-proof">{speaker.facts[0]}</strong>}
                </div>
              </button>
            ))}
          </div>
          <div className="slider-footer">
            <div className="scroll-hint">Нажмите на карточку, чтобы узнать подробнее</div>
            <div className="slider-controls" aria-label="Навигация по спикерам">
              <button type="button" onClick={() => onScroll(-1)} aria-label="Предыдущие спикеры"><ChevronIcon direction="left" /></button>
              <button type="button" onClick={() => onScroll(1)} aria-label="Следующие спикеры"><ChevronIcon direction="right" /></button>
            </div>
          </div>
        </div>
      </section>
      <section className="section cta-section">
        <div className="container cta-card">
          <div><p className="section-label">Открыт набор экспертов</p><h2>Хотите стать <span>спикером фестиваля?</span></h2><p>Если у вас есть сильная практика и понятный результат для аудитории, оставляйте заявку на участие в программе.</p></div>
          <a className="secondary-button" href={`${telegramUrl}?text=${encodeURIComponent("Хочу стать спикером фестиваля МЖ")}`} target="_blank" rel="noreferrer">Стать спикером <i className="button-icon"><ArrowIcon /></i></a>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [cookieVisible, setCookieVisible] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [connectionScores, setConnectionScores] = useState<Record<ConnectionCode, number>>({
    dialogue: 0,
    support: 0,
    spark: 0,
    space: 0,
    depth: 0,
  });
  const [connectionResult, setConnectionResult] = useState<{ primary: ConnectionCode; secondary: ConnectionCode } | null>(null);
  const connectionQuizRef = useRef<HTMLDivElement>(null);
  const speakersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCookieVisible(window.localStorage.getItem("mj-cookie-ok") !== "1");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!selectedSpeaker) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.querySelector<HTMLElement>(".speaker-modal");
    const controls = () => [...(dialog?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]') ?? [])];
    controls()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSpeaker(null);
      if (event.key !== "Tab") return;
      const focusable = controls();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.body.style.overflow = selectedSpeaker ? "hidden" : "";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [selectedSpeaker]);

  const startConnectionQuiz = () => {
    setConnectionStep(0);
    setConnectionStatus(null);
    setConnectionScores({ dialogue: 0, support: 0, spark: 0, space: 0, depth: 0 });
    setConnectionResult(null);
    window.requestAnimationFrame(() => connectionQuizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const chooseConnectionStatus = (status: ConnectionStatus) => {
    setConnectionStatus(status);
    setConnectionStep(1);
  };

  const chooseConnectionAnswer = (answer: ConnectionAnswer) => {
    const nextScores = { ...connectionScores };
    (Object.keys(answer.scores) as ConnectionCode[]).forEach((code) => {
      nextScores[code] += answer.scores[code] ?? 0;
    });
    setConnectionScores(nextScores);

    if (connectionStep === connectionQuestions.length) {
      const ranked = (Object.entries(nextScores) as [ConnectionCode, number][]).sort((a, b) => b[1] - a[1]);
      setConnectionResult({ primary: ranked[0][0], secondary: ranked[1][0] });
      window.requestAnimationFrame(() => connectionQuizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }

    setConnectionStep((current) => current + 1);
  };

  const acceptCookies = () => {
    window.localStorage.setItem("mj-cookie-ok", "1");
    setCookieVisible(false);
  };

  const scrollSlider = (track: HTMLDivElement | null, direction: -1 | 1) => {
    if (!track) return;
    track.scrollBy({ left: direction * Math.min(track.clientWidth * 0.86, 820), behavior: "smooth" });
  };

  const currentConnectionQuestion = connectionStep > 0 ? connectionQuestions[connectionStep - 1] : null;
  const primaryConnectionResult = connectionResult ? connectionResults[connectionResult.primary] : null;
  const secondaryConnectionResult = connectionResult ? connectionResults[connectionResult.secondary] : null;
  const connectionProgress = connectionResult ? 100 : Math.max(1, connectionStep + 1) / (connectionQuestions.length + 1) * 100;

  return (
    <main>
      <nav className="floating-nav" aria-label="Навигация по странице">
        <a className="nav-brand" href="#">
          <strong>Мужчина и Женщина</strong>
          <span>22 августа 2026</span>
        </a>
        <div className="nav-links">
          <a href="#connection-code"><span>●</span> Код связи</a>
          <a href="#dating"><span>●</span> Дейтинг</a>
          <a href="#program"><span>●</span> Программа</a>
          <a href="#speakers"><span>●</span> Спикеры</a>
          <a href="#expo"><span>●</span> Экспозона</a>
          <a href="#pricing"><span>●</span> Тарифы</a>
          <a href="/gifts/"><span>●</span> Подарки</a>
        </div>
        <a className="nav-bonus-cta" href="/gifts/" aria-label="Забрать подарки">
          <span className="nav-bonus-full">Забрать подарки</span>
          <span className="nav-bonus-short">Подарки</span>
        </a>
        <details className="mobile-nav">
          <summary aria-label="Открыть меню">Меню</summary>
          <div>
            <a href="#connection-code">Код связи</a>
            <a href="#dating">Дейтинг и браслеты</a>
            <a href="#program">Программа</a>
            <a href="#speakers">Спикеры</a>
            <a href="#expo">Экспозона</a>
            <a href="#consultations">Консультации и практики</a>
            <a href="#partnership">Партнерство</a>
            <a href="#pricing">Тарифы</a>
            <a href="/gifts/">Получить подарки</a>
          </div>
        </details>
      </nav>

      <section className="hero has-intro">
        <HeroAnimation />
        <div className="container hero-inner reveal" id="festival-introduction">
          <div className="eyebrow-row">
            <div className="eyebrow-item"><strong>Где</strong><span>Санкт-Петербург<br />Дворец Кваренги, Казанская 7</span></div>
            <div className="eyebrow-item"><strong>Когда</strong><span>22 августа 2026<br />Регистрация с 12:00<br />Программа с 13:00</span></div>
          </div>
          <div className="hero-grid">
            <div>
              <p className="kicker">Фестиваль отношений нового времени</p>
              <h1>Мужчина и Женщина.<br /><em>Перезагрузка</em></h1>
              <p className="hero-lead">Для тех, кто хочет встретить своего человека, вернуть близость в паре или перестать повторять старые сценарии.</p>
              <div className="hero-actions">
                <a className="primary-button hero-button" href="#pricing"><span>Выбрать билет от 990 ₽</span><i className="button-icon"><ArrowIcon /></i></a>
                <a className="hero-quiz-link" href="#connection-code"><b>90 секунд</b><span>Узнать свой код связи</span></a>
              </div>
              <a className="hero-charity-badge" href="#pricing" aria-label="5 процентов с каждого билета передадим фонду Энби">
                <span className="hero-charity-mark"><HeartHandsIcon /></span>
                <span className="hero-charity-percent">5%</span>
                <span className="hero-charity-copy"><b>билета - детям</b><small>вместе с фондом «Энби»</small></span>
                <img src="/partners/enbi.png" alt="Энби" />
              </a>
            </div>
            <div className="hero-facts-card" aria-label="Что будет на фестивале">
              <span>За один день</span>
              <ul>
                <li><b>{speakers.length}</b> экспертов</li>
                <li><b>2</b> зала</li>
                <li>Практики и личные разборы</li>
                <li>Живые знакомства</li>
                <li>Подарки до <b>100 000 ₽</b></li>
              </ul>
            </div>
          </div>
          <div className="stats-bar">
            <div><strong>Второй</strong><span>фестиваль проекта</span></div>
            <div><strong>550</strong><span>гостей на прошлом событии</span></div>
            <div><strong>{speakers.length}</strong><span>спикеров</span></div>
            <div><strong>2 зала</strong><span>одна программа</span></div>
          </div>
        </div>
      </section>

      <AttendeeSection />

      <section className="section connection-section" id="connection-code">
        <div className="container">
          <details className="connection-compact">
            <summary>
              <span><small>Интерактив · 90 секунд</small><strong>Узнайте свой код связи</strong><em>Как вы строите близость, кто вам подходит и что мешает отношениям</em></span>              <b>Пройти тест <i><ArrowIcon /></i></b>
            </summary>          <div className="connection-experience" id="connection-quiz" ref={connectionQuizRef}>
            {!connectionResult && (              <div className="connection-question-card" aria-live="polite">
                <div className="connection-progress-head">
                  <span>Код связи</span>
                  <strong>{String(connectionStep + 1).padStart(2, "0")} / 07</strong>
                </div>
                <div className="connection-progress" aria-hidden="true"><i style={{ width: `${connectionProgress}%` }} /></div>

                {connectionStep === 0 ? (
                  <div className="connection-question-copy">
                    <p>Сначала о вас</p>
                    <h3>Какое описание подходит вам сейчас?</h3>
                    <div className="connection-answers">
                      {connectionStatusOptions.map((option) => (
                        <button type="button" key={option.value} onClick={() => chooseConnectionStatus(option.value)}>
                          <span><b>{option.label}</b><small>{option.note}</small></span><i><ArrowIcon /></i>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : currentConnectionQuestion ? (
                  <div className="connection-question-copy">
                    <p>{currentConnectionQuestion.eyebrow}</p>
                    <h3>{currentConnectionQuestion.question}</h3>
                    <div className="connection-answers">
                      {currentConnectionQuestion.answers.map((answer) => (
                        <button type="button" key={answer.label} onClick={() => chooseConnectionAnswer(answer)}>
                          <span><b>{answer.label}</b><small>{answer.note}</small></span><i><ArrowIcon /></i>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <button className="connection-restart-link" type="button" onClick={startConnectionQuiz}>Начать заново</button>
              </div>
            )}

            {connectionResult && primaryConnectionResult && secondaryConnectionResult && connectionStatus && (
              <div className="connection-result-card" aria-live="polite">
                <div className="connection-result-head">
                  <p>Ваш сценарий связи</p>
                  <h3>{primaryConnectionResult.label}</h3>
                  <strong>{primaryConnectionResult.title}</strong>
                  <p>{primaryConnectionResult.summary}</p>
                </div>

                <div className="connection-result-grid">
                  <article className="connection-scenario">
                    <span>Как это выглядит в жизни</span>
                    <p>{primaryConnectionResult.scenario}</p>
                  </article>
                  <article className="connection-strength">
                    <span>Ваша сильная сторона</span>
                    <p>{primaryConnectionResult.strength}</p>
                  </article>
                  <article className="connection-blind-spot">
                    <span>Главная слепая зона</span>
                    <p>{primaryConnectionResult.blindSpot}</p>
                  </article>
                  <article className="connection-partner-fit">
                    <span>Какой партнёр вам подходит</span>
                    <p>{primaryConnectionResult.partner}</p>
                  </article>
                </div>

                <div className="connection-conversations">
                  <span>Три конкретных шага</span>
                  <ol>
                    {primaryConnectionResult.steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                </div>

                <div className="connection-festival-bridge">
                  <div>
                    <span>Продолжение — вживую</span>
                    <p>{connectionStatusCopy[connectionStatus]}</p>
                  </div>
                </div>

                <div className="connection-speaker-route">
                  <div className="connection-speaker-route-head">
                    <span>Продолжить на фестивале</span>
                    <h4>Познакомиться с подходами экспертов</h4>
                    <p>Выберите интересующее направление. Темы выступлений, форматы и доступность встреч уточняются в карточках.</p>
                  </div>
                  <div className="connection-speaker-route-list">
                    <article><a href="#speakers">Спикеры и темы</a><p>Согласованные темы и информация об экспертах.</p></article>
                    <article><a href="#consultations">Консультации и практики</a><p>Возможные форматы личного знакомства и разбора ситуации.</p></article>
                  </div>
                </div>

                <div className="connection-screenshot-tip">
                  <span>Сохраните результат</span>
                  <p>Сделайте скриншот этой карточки и отправьте партнёру или другу — так результат сохранится вместе с пояснениями и вопросами.</p>
                </div>

                <div className="connection-result-actions">
                  <a className="primary-button" href="#pricing"><span>Выбрать билет</span><i className="button-icon"><ArrowIcon /></i></a>
                  <button type="button" onClick={startConnectionQuiz}>Пройти ещё раз</button>
                </div>
                <small className="connection-disclaimer">Результат предназначен для саморефлексии и не является психологической диагностикой.</small>
              </div>
            )}
          </div>
          </details>
        </div>
      </section>

      <section className="section dark-section" id="audience">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <p className="section-label">Для кого фестиваль</p>
              <h2>Выберите <span>свою ситуацию</span></h2>
            </div>
            <p>Три маршрута - поиск отношений, работа с парой или возвращение к себе.</p>
          </div>
          <div className="audience-grid">
            {audience.map((item) => (
              <article className="audience-card" key={item.number}>
                <div className="audience-image"><img src={item.image} alt="" loading="lazy" /></div>
                <div className="audience-card-body">
                  <div className="card-top"><span>Сценарий</span><strong>{item.number}</strong></div>
                  <p className="card-label">{item.label}</p>
                  <h3>{item.title}</h3>
                  <ul>
                    {item.points.map((point) => <li key={point}><b aria-hidden="true">✓</b>{point}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section formats-section" id="festival-formats">
        <div className="container">
          <div className="section-heading center-heading">
            <p className="section-label">За один день</p>
            <h2>Не только слушать. <span>Участвовать.</span></h2>
            <p>Всё главное - в пяти понятных форматах.</p>
          </div>
          <div className="formats-track">
            {formats.map((format) => (
              <article className={`format-card format-card-${format.number}`} key={format.number}>
                <span className="format-number">{format.number}</span>
                <div className="format-content">
                  <span className="format-benefit">{format.benefit}</span>
                  <h3>{format.title}</h3>
                  <p>{format.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="formats-total">
            <strong>5 форматов</strong>
            <span>Форматы и условия отдельных встреч уточняются</span>
          </div>
        </div>
      </section>

      <section className="section dating-section" id="dating">
        <div className="container dating-shell">
          <div className="dating-copy">
            <p className="section-label">Дейтинг и браслеты</p>
            <h2>Сразу видно, <span>кто открыт к знакомству</span></h2>
            <p className="dating-lead">Выберите браслет на регистрации. Цвет покажет окружающим комфортный для вас формат общения - без неловких догадок.</p>

            <a className="primary-button dating-button" href="#pricing"><span>Выбрать билет</span><i className="button-icon"><ArrowIcon /></i></a>
          </div>

          <div className="bracelet-stage" aria-label="Значения браслетов фестиваля">
            <div className="bracelet-product" role="img" aria-label="Зелёный и красный браслеты фестиваля">
              <div className="bracelet-product-caption">
                <span>Вы получаете браслет на входе</span>
                <strong>Цвет говорит за вас</strong>
              </div>
            </div>
            <div className="bracelet-legend">
              <article className="bracelet-legend-green">
                <b aria-hidden="true" />
                <div><span>Зелёный</span><strong>Открыт к знакомствам</strong><p>Хочу встретить своего человека.</p></div>
              </article>
              <article className="bracelet-legend-red">
                <b aria-hidden="true" />
                <div><span>Красный</span><strong>Не знакомлюсь</strong><p>Пришёл в паре или только за программой.</p></div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <ProgramSection />
      <SpeakersSection
        trackRef={speakersRef}
        onSelect={setSelectedSpeaker}
        onScroll={(direction) => scrollSlider(speakersRef.current, direction)}
      />

      <ExpoSection />
      <ConsultationsSection />
      <BonusSection />
      <PricingSection />

      <section className="section partners-section">
        <div className="container">
          <div className="section-heading center-heading">
            <p className="section-label">Сильные проекты рядом</p>
            <h2>Партнеры</h2>
          </div>
          <div className="partner-grid">
            {partners.map((partner) => (
              <div className="partner-card" key={partner.name}>
                <img src={partner.image} alt={partner.name} loading="lazy" />
                <strong>{partner.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section partnership-section" id="partnership">
        <div className="container partnership-card">
          <div className="partnership-copy">
            <p className="section-label">Для брендов и сообществ</p>
            <h2>Хотите стать <span>партнером фестиваля?</span></h2>
            <p>Заявите о своем бренде аудитории 500+ гостей, повысьте доверие и получите медийный охват. Обсудим формат, который решит именно вашу задачу.</p>
            <a className="primary-button" href={`${telegramUrl}?text=${encodeURIComponent("Хочу стать партнером фестиваля МЖ")}`} target="_blank" rel="noreferrer"><span>Стать партнером</span><i className="button-icon"><ArrowIcon /></i></a>
          </div>
          <div className="partnership-graphic"><span>500+</span><p>гостей фестиваля</p><b>Партнерство<br />с результатом</b></div>
        </div>
      </section>

      <section className="section logistics-section" id="logistics">
        <div className="container logistics-card">
          <div className="logistics-main">
            <p className="section-label">Сохраните этот экран</p>
            <span className="logistics-date">22.08.2026</span>
            <h2>Дворец <span>Кваренги</span></h2>
            <p className="logistics-address">Санкт-Петербург<br />Казанская улица, 7</p>
            <a className="primary-button" href="https://yandex.ru/maps/?text=%D0%94%D0%B2%D0%BE%D1%80%D0%B5%D1%86%20%D0%9A%D0%B2%D0%B0%D1%80%D0%B5%D0%BD%D0%B3%D0%B8%2C%20%D0%9A%D0%B0%D0%B7%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F%207" target="_blank" rel="noreferrer"><span>Открыть маршрут</span><i className="button-icon"><ArrowIcon /></i></a>
          </div>
          <div className="logistics-facts">
            <article><span>12:00</span><p>Начало регистрации гостей</p></article>
            <article><span>13:00</span><p>Старт основной программы</p></article>
            <article><span>20:00</span><p>Завершение фестивального дня</p></article>
            <div className="logistics-note"><strong>Возьмите с собой</strong><p>Билет в телефоне, документ, зарядное устройство и вопросы, которые давно откладывали.</p></div>
          </div>
        </div>
      </section>

      <section className="section final-cta-section">
        <div className="container final-cta">
          <p>22 августа · Санкт-Петербург</p>
          <h2>Можно снова отложить отношения.<br /><span>Или сделать первый реальный шаг.</span></h2>
          <div>
            <a className="primary-button" href="#pricing"><span>Выбрать билет от 990 ₽</span><i className="button-icon"><ArrowIcon /></i></a>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-grid">
          <div><strong>МЖ</strong><p>Мужчина и Женщина.<br />Перезагрузка</p></div>
          <div><span>Задать вопрос</span><a href="tel:+79625759813">8 962 575-98-13</a><a href={telegramUrl} target="_blank" rel="noreferrer">Telegram: @redheadlitle</a><a href="mailto:noname.eventspb@gmail.com">noname.eventspb@gmail.com</a></div>
          <div><span>Адрес</span><p>Санкт-Петербург<br />Дворец Кваренги, Казанская 7</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Фестиваль «Мужчина и Женщина»</span><a href="#">Вернуться к началу</a></div>
      </footer>

      {selectedSpeaker && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedSpeaker(null)}>
          <article className="speaker-modal" role="dialog" aria-modal="true" aria-labelledby="speaker-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSpeaker(null)} aria-label="Закрыть">×</button>
            <div className={`modal-visual ${selectedSpeaker.tone}${selectedSpeaker.image ? " has-photo" : ""}`}>
              {selectedSpeaker.image ? (
                <img src={selectedSpeaker.image} alt={selectedSpeaker.name} style={{ objectPosition: selectedSpeaker.imagePosition }} />
              ) : (
                <span>{selectedSpeaker.initials}</span>
              )}
            </div>
            <div className="modal-copy">
              <p className="section-label">Спикер фестиваля</p>
              <h2 id="speaker-modal-title">{selectedSpeaker.name}</h2>
              <p className="modal-role">{selectedSpeaker.role}</p>
              <div className="modal-topic"><span>Тема выступления</span><strong>{selectedSpeaker.topic ?? "Тема требует согласования"}</strong></div>
              {selectedSpeaker.note && <p className="festival-pending">{selectedSpeaker.note}</p>}
              {selectedSpeaker.description && <p className="modal-description">{selectedSpeaker.description}</p>}
              {selectedSpeaker.facts.length > 0 && <ul>{selectedSpeaker.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>}
              <div className="speaker-project-links">{selectedSpeaker.links?.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>
            </div>
          </article>
        </div>
      )}

      {cookieVisible && (
        <div className="cookie-banner">
          <p>Мы используем только необходимые cookie для корректной работы сайта.</p>
          <button onClick={acceptCookies}>Понятно</button>
        </div>
      )}
    </main>
  );
}
